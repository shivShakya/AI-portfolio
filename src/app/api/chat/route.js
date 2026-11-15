import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { getKnowledge, findRelevant } from "@/lib/portfolioKnowledge";

// Only GROQ_API_KEY is needed. Knowledge comes from the site's own JSON files (see src/lib/portfolioKnowledge.js).
const MODEL = "openai/gpt-oss-120b";
const HISTORY_TURNS = 6; // messages kept per conversation (3 questions + 3 answers)
const MAX_SESSIONS = 500;
const MAX_PROMPT_CHARS = 500;
const LINKS = ["project", "blog", "education", "experience", "contact", "skills", "resume", "portfolio"];

// At most one retry, so a rate limit shows up quickly instead of silently adding seconds.
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY, maxRetries: 1, timeout: 20_000 }) : null;
const sessions = new Map(); // sessionId -> [{ role, content }]

const instructions = (projectIds) => `You are the AI assistant on Shivam Shakya's portfolio website. Answer visitors' questions about Shivam in the first person, as Shivam ("I built...", "my experience...").

Rules:
- Use only the facts in PORTFOLIO below (and RELEVANT DETAILS when given). If something isn't there, say you don't have that detail and suggest the Contact page.
- Keep answers short and friendly: 1 to 3 sentences, plain text, no markdown.
- Reply with a JSON object only, in this shape:
  {"response": "<answer>", "link": "<optional section>", "path": "<optional project id>"}
- "link" opens a section of the site. Use it when the answer is about a whole section. Allowed: ${LINKS.join(", ")}.
- "path" opens one project's detail page. Use it when the answer is about one specific project. Allowed: ${projectIds.join(", ")}.
- Use at most one of "link" or "path". Leave both out for small talk.`;

// Pull the first JSON object out of the model text and keep only valid fields.
function normalize(raw, projectIds, projectTitles) {
  let obj = null;
  try {
    obj = JSON.parse(raw);
  } catch {
    const m = raw?.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        obj = JSON.parse(m[0]);
      } catch {}
    }
  }
  const response =
    typeof obj?.response === "string" && obj.response.trim()
      ? obj.response.trim()
      : (raw || "").trim() || "Sorry, I couldn't come up with an answer. Please try asking another way.";

  const out = { response };
  const path = Array.isArray(obj?.path) ? obj.path[0] : obj?.path;
  if (typeof path === "string" && projectIds.includes(path)) {
    out.path = [path];
    out.pathTitle = projectTitles[path];
  }
  else if (typeof obj?.link === "string" && LINKS.includes(obj.link)) out.link = obj.link;
  return out;
}

// Returns the completion plus Groq's rate-limit headers (logged in development).
async function complete(messages) {
  const base = { model: MODEL, messages, temperature: 0.4, max_completion_tokens: 1024 };
  const run = async (params) => {
    const { data, response } = await groq.chat.completions.create(params).withResponse();
    return { completion: data, headers: response.headers };
  };
  try {
    return await run({
      ...base,
      response_format: { type: "json_object" },
      reasoning_effort: "low", // gpt-oss reasons before answering; low keeps replies fast
    });
  } catch (err) {
    // If the model rejects JSON mode / reasoning_effort, retry plainly; normalize() still parses the reply.
    if (err?.status === 400) return run(base);
    throw err;
  }
}

export async function POST(request) {
  if (!groq) {
    console.error("GROQ_API_KEY is not set. Add it to .env and restart the server.");
    return NextResponse.json({ error: "AI is not configured" }, { status: 500 });
  }

  try {
    const { prompt, sessionId } = await request.json();
    const question = typeof prompt === "string" ? prompt.trim().slice(0, MAX_PROMPT_CHARS) : "";
    if (!question || !sessionId) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const { core, projectIds, projectTitles } = getKnowledge();
    const details = findRelevant(question);
    const history = sessions.get(sessionId) || [];

    // Static system prompt first (same every request, so Groq's prompt cache can reuse it),
    // then recent turns, then the question with any extra details for it.
    const messages = [
      { role: "system", content: `${instructions(projectIds)}\n\nPORTFOLIO\n${core}` },
      ...history,
      {
        role: "user",
        content: details.length
          ? `RELEVANT DETAILS\n${details.map((d) => d.text).join("\n\n")}\n\nQUESTION\n${question}`
          : question,
      },
    ];

    const startedAt = Date.now();
    const { completion, headers } = await complete(messages);
    const result = normalize(completion.choices[0]?.message?.content, projectIds, projectTitles);

    // Remember the plain question and answer only (not the injected details).
    const updated = [...history, { role: "user", content: question }, { role: "assistant", content: result.response }].slice(
      -HISTORY_TURNS
    );
    sessions.delete(sessionId);
    sessions.set(sessionId, updated);
    if (sessions.size > MAX_SESSIONS) sessions.delete(sessions.keys().next().value);

    if (process.env.NODE_ENV !== "production") {
      console.log("[chat]", {
        question,
        details: details.map((d) => d.title),
        ms: Date.now() - startedAt,
        groqSeconds: completion.usage?.total_time,
        tokens: completion.usage?.total_tokens,
        cached: completion.usage?.prompt_tokens_details?.cached_tokens ?? 0,
        rateLimit: {
          requestsLeft: headers.get("x-ratelimit-remaining-requests"),
          tokensLeft: headers.get("x-ratelimit-remaining-tokens"),
          tokensResetIn: headers.get("x-ratelimit-reset-tokens"),
        },
        result,
      });
    }

    // The client parses this string (kept for compatibility with the existing chat UI).
    return NextResponse.json({ response: JSON.stringify(result) });
  } catch (error) {
    if (error?.status === 429) {
      console.warn("[chat] Groq rate limit hit:", error?.headers?.get?.("retry-after") ? `retry after ${error.headers.get("retry-after")}s` : error?.message);
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    console.error("Chat API error:", error?.status ?? "", error?.message ?? error);
    return NextResponse.json({ error: "Failed to process the request" }, { status: 500 });
  }
}
