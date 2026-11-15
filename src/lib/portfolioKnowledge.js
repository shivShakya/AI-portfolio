// Server-only: builds the AI's knowledge from the site's own JSON files in /public.
// - core: a compact summary sent with every question (static, so Groq can cache it)
// - chunks: detailed sections, added only when a question mentions them (keyword match, no external calls)
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const PUBLIC = path.join(process.cwd(), "public");
const read = (p) => JSON.parse(readFileSync(path.join(PUBLIC, p), "utf8"));
const readIf = (p) => (existsSync(path.join(PUBLIC, p)) ? read(p) : null);

const LINKS = {
  linkedin: "https://www.linkedin.com/in/shivam-shakya13/",
  github: "https://github.com/shivShakya",
  twitter: "https://twitter.com/ShivamS76398678",
};

// Extra project detail files that aren't in the projects list but can still be opened.
const EXTRA_PROJECTS = ["finetune", "AR_Projects"];

const STOP = new Set(
  "the and for with you your are was were what which who how does did can tell about from that this have has had any all into over more most some show give me my his her its our their there here want know please project projects work worked working".split(
    " "
  )
);

// Words too common across the portfolio to identify one item: they only count weakly.
const GENERIC = new Set(["ai", "ml", "3d", "app", "system", "web", "platform", "development", "developer", "interactive"]);

// Short words that still matter in this domain.
const SHORT = new Set(["ai", "ml", "vr", "ar", "xr", "3d", "ui", "ux", "db", "go"]);

const tokenize = (text) =>
  (text.toLowerCase().match(/[a-z0-9.+#]+/g) || [])
    .map((t) => t.replace(/\.+$/, ""))
    .filter((t) => (t.length >= 3 || SHORT.has(t)) && !STOP.has(t));

const clean = (s) => String(s ?? "").replace(/&apos;/g, "'").replace(/\s+/g, " ").trim();
const list = (arr, max = 99) => (Array.isArray(arr) ? arr.slice(0, max).map(clean).join("; ") : "");

// "Software Engineer at Meta Design Solutions, Gurugram" -> pieces
const splitRole = (title) => {
  const [role, rest = ""] = title.includes(" at ") ? title.split(/ at (.+)/) : [title, ""];
  return { role, org: rest };
};

function build() {
  const experience = read("experience/experience.json");
  const education = read("education/education.json");
  const skills = read("skills/skills.json");
  const projects = read("projects/projects.json");
  const blogs = readIf("blogs/blogs.json") || [];
  const info = readIf("Info/Info.json");

  const projectIds = [...projects.map((p) => p.id), ...EXTRA_PROJECTS.filter((id) => readIf(`projects/${id}.json`))];

  // ---------- core summary (always sent) ----------
  const core = [
    "PROFILE",
    "Shivam Shakya, Software Engineer based in India. About 3 years of experience across AI engineering, full-stack development and immersive 3D (Three.js, Unity).",
    `Links: LinkedIn ${LINKS.linkedin} | GitHub ${LINKS.github} | Twitter ${LINKS.twitter}. Visitors can also use the Contact page.`,
    info?.profile?.hobbies ? `Outside work: ${clean(info.profile.hobbies)}` : "",
    "",
    "EXPERIENCE (most recent first)",
    // The two most recent roles get a one-line highlight so common questions need no extra details.
    ...experience.map(
      (e, i) =>
        `- ${clean(e.title)} (${clean(e.duration)})${i === 0 ? " [current]" : ""}${
          i < 2 && e.description?.[0] ? `: ${clean(e.description[0]).slice(0, 160)}` : ""
        }`
    ),
    "",
    "EDUCATION",
    ...education.map((e) => `- ${clean(e.title)}`),
    "",
    "SKILLS",
    ...skills.map((c) => `- ${clean(c.title)}: ${list(c.skills)}`),
    "",
    "PROJECTS (path id: title, summary)",
    ...projects.map((p) => `- ${p.id}: ${clean(p.title)}, ${clean(p.description)}`),
    ...EXTRA_PROJECTS.filter((id) => !projects.some((p) => p.id === id))
      .map((id) => [id, readIf(`projects/${id}.json`)])
      .filter(([, d]) => d)
      .map(([id, d]) => `- ${id}: ${clean(d.title)}`),
    "",
    blogs.length ? "BLOG POSTS" : "",
    ...blogs.map((b) => `- ${clean(b.title)}: ${clean(b.description)}`),
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");

  // ---------- detail chunks (added on demand) ----------
  const chunks = [];

  experience.forEach((e) => {
    const { role, org } = splitRole(e.title);
    chunks.push({
      title: `Experience: ${clean(e.title)}`,
      strong: tokenize(`${org} ${role}`),
      weak: tokenize(e.description.join(" ")),
      text: `${clean(e.title)} (${clean(e.duration)})\n${e.description.map((d) => `- ${clean(d)}`).join("\n")}`,
    });
  });

  education.forEach((e) => {
    chunks.push({
      title: `Education: ${clean(e.title)}`,
      strong: tokenize(e.title),
      weak: tokenize(`${e.description.join(" ")} education degree`),
      text: `${clean(e.title)}\n${e.description.map(clean).join("\n")}`,
    });
  });

  projectIds.forEach((id) => {
    const d = readIf(`projects/${id}.json`);
    if (!d) return;
    const listed = projects.find((p) => p.id === id);
    chunks.push({
      title: `Project ${id}`,
      strong: tokenize(`${id.replace(/[_-]/g, " ")} ${d.title} ${listed?.title ?? ""}`),
      weak: tokenize(`${list(d.technologies)} ${list(d.features)}`),
      text: [
        `Project ${id}: ${clean(d.title)}`,
        clean(d.description).slice(0, 900),
        d.features?.length ? `Features: ${list(d.features, 8)}` : "",
        d.technologies?.length ? `Tech: ${list(d.technologies)}` : "",
        d.useCases?.length ? `Use cases: ${list(d.useCases, 5)}` : "",
        d.link ? `Live: ${d.link}` : "",
        d.github_link ? `Code: ${d.github_link}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  });

  blogs.forEach((b) => {
    chunks.push({
      title: `Blog: ${clean(b.title)}`,
      strong: tokenize(`${b.title} ${b.tag} blog`),
      weak: tokenize(b.description),
      text: `Blog post "${clean(b.title)}" (${clean(b.date)})\n${clean(b.description)}\n${(b.content || [])
        .filter((p) => !p.startsWith("## "))
        .slice(0, 4)
        .map(clean)
        .join(" ")
        .slice(0, 900)}`,
    });
  });

  // How many items share each name/title word: a word in 2 titles (like "meta") counts half as much.
  const strongDF = new Map();
  chunks.forEach((c) => new Set(c.strong).forEach((t) => strongDF.set(t, (strongDF.get(t) || 0) + 1)));

  // Display names for "Opened project: …" notices in the chat.
  const projectTitles = Object.fromEntries(
    projectIds.map((id) => [id, clean(projects.find((p) => p.id === id)?.title || readIf(`projects/${id}.json`)?.title || id)])
  );

  return { core, chunks, projectIds, projectTitles, strongDF };
}

let cache = null;

// Rebuilt on every call in development (so edits to the JSON show up immediately), cached in production.
export function getKnowledge() {
  if (process.env.NODE_ENV !== "production" || !cache) cache = build();
  return cache;
}

// Keyword retrieval: name/title words count 3, tech/feature words count 1.
// Name words shared by several items count less ("meta" is in Meta Design and Meta Zoo).
// Returns up to `max` chunks that clearly match; a second one must score over half of the best.
export function findRelevant(question, { max = 2 } = {}) {
  const { chunks, strongDF } = getKnowledge();
  const q = new Set(tokenize(question));
  if (!q.size) return [];
  return chunks
    .map((c) => {
      let score = 0;
      const strong = new Set(c.strong);
      for (const t of strong) if (q.has(t)) score += GENERIC.has(t) ? 1 : 3 / (strongDF.get(t) || 1);
      for (const t of new Set(c.weak)) if (q.has(t) && !strong.has(t)) score += 1;
      return { c, score };
    })
    .filter((x) => x.score >= 1.5) // a name/title hit (even one shared by two items), or two detail words
    .sort((a, b) => b.score - a.score)
    .filter((x, _, arr) => x.score > arr[0].score / 2)
    .slice(0, max)
    .map((x) => x.c);
}
