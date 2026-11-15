// Generates the chat's welcome voice once and saves it as static files, so it plays instantly
// when the chat opens (no API call per visitor).
//   node scripts/generate-greeting-voice.mjs
// Re-run it whenever GREETING.spoken in src/app/Dashboard/Chatbot/chatClient.ts changes.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
const key = env.UNREAL_API_KEY || process.env.UNREAL_API_KEY;
if (!key) throw new Error("UNREAL_API_KEY not found in .env");

// Take the spoken greeting straight from the app code, so the two never drift apart.
const src = readFileSync("src/app/Dashboard/Chatbot/chatClient.ts", "utf8");
const text = src.match(/spoken:\s*"([^"]+)"/)?.[1];
if (!text) throw new Error("Couldn't find GREETING.spoken in chatClient.ts");

// Same voice settings as /api/voice.
const res = await fetch("https://api.v7.unrealspeech.com/speech", {
  method: "POST",
  headers: { accept: "application/json", "content-type": "application/json", Authorization: `Bearer ${key}` },
  body: JSON.stringify({ Text: text, VoiceId: "Dan", Bitrate: "192k", Speed: "0", Pitch: "1", TimestampType: "word" }),
});
if (!res.ok) throw new Error(`Unreal Speech error ${res.status}: ${await res.text()}`);
const job = await res.json();
if (job.TaskStatus !== "completed") throw new Error(`Unexpected status: ${job.TaskStatus}`);

mkdirSync("public/voice", { recursive: true });
const audio = Buffer.from(await (await fetch(job.OutputUri)).arrayBuffer());
writeFileSync("public/voice/greeting.mp3", audio);
const timestamps = await (await fetch(job.TimestampsUri)).text();
writeFileSync("public/voice/greeting-timestamps.json", timestamps);

console.log(`Saved public/voice/greeting.mp3 (${Math.round(audio.length / 1024)} KB) and greeting-timestamps.json`);
console.log(`Text: "${text}"`);
