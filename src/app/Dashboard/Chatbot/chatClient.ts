// Asking the AI and speaking replies. Shared by typing (TextBot) and voice (Stt).
// The answer text is shown as soon as it arrives; the spoken audio follows when it's ready.
import { store } from "@/redux/store";
import { addMessage, setPhase, resetChat, setChatOpen } from "@/redux/chatSlice";
import { setVoiceContent } from "@/redux/voiceContent";
import { voiceBus } from "./voiceBus";
import { applyAiNavigation, type AiReply } from "./aiNavigation";

export const GREETING = {
  text: "Hi! 👋 Welcome to my portfolio. I'm Shivam's AI twin. Ask me anything about my work, projects or skills. I'm listening, or you can type.",
  spoken: "Hi! Welcome to my portfolio. I'm Shivam's AI twin. Ask me anything about my work, projects or skills. I'm listening.",
};

// Pre-recorded welcome voice (made by scripts/generate-greeting-voice.mjs), so it plays instantly.
const GREETING_VOICE = {
  TaskStatus: "completed",
  OutputUri: "/voice/greeting.mp3",
  TimestampsUri: "/voice/greeting-timestamps.json",
};

/** Warm the browser cache (greeting audio + avatar model) so opening the chat feels instant. */
export function preloadChatAssets() {
  if (typeof window === "undefined") return;
  [GREETING_VOICE.OutputUri, GREETING_VOICE.TimestampsUri, "/me.glb"].forEach((url) =>
    fetch(url, { priority: "low" } as RequestInit).catch(() => {})
  );
}

/** Play the saved welcome voice through the avatar (with lip-sync). */
export function playGreeting() {
  store.dispatch(setVoiceContent(GREETING_VOICE));
}

let controller: AbortController | null = null;
let turn = 0;

const isAbort = (e: unknown) => e instanceof DOMException && e.name === "AbortError";

/** Speak a reply through the avatar (needs UNREAL_API_KEY). Only while voice chat is on. */
export async function speak(text: string, signal?: AbortSignal) {
  if (!store.getState().chat.voiceOn) return;
  try {
    const res = await fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal,
    });
    if (!res.ok || !store.getState().chat.voiceOn || signal?.aborted) return;
    store.dispatch(setVoiceContent(await res.json())); // VoiceBot plays it
  } catch (e) {
    if (!isAbort(e)) console.error("Voice error:", e);
  }
}

/** Send a question. A newer question cancels an older one still in flight. */
export async function askAI(text: string) {
  const { dispatch } = store;
  const myTurn = ++turn;
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  voiceBus.stop(); // a new question replaces any answer still playing
  dispatch(addMessage({ role: "user", text }));
  dispatch(setPhase("thinking"));

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text, sessionId: store.getState().chat.sessionId }),
      signal,
    });
    if (res.status === 429) {
      if (myTurn === turn) dispatch(addMessage({ role: "error", text: "I'm getting a lot of questions right now. Give me a few seconds and ask again." }));
      return;
    }
    if (!res.ok) throw new Error(`chat ${res.status}`);
    const data = await res.json();
    const answer = JSON.parse(data.response) as AiReply;
    if (myTurn !== turn) return;

    dispatch(addMessage({ role: "assistant", text: answer.response })); // text first
    const opened = applyAiNavigation(dispatch, answer);
    if (opened) dispatch(addMessage({ role: "event", ...opened }));

    if (store.getState().chat.voiceOn) {
      dispatch(setPhase("voicing"));
      await speak(answer.response, signal); // then voice
    }
  } catch (e) {
    if (isAbort(e) || myTurn !== turn) return;
    console.error("Chat error:", e);
    dispatch(addMessage({ role: "error", text: "I'm having trouble connecting right now. Please try again." }));
  } finally {
    if (myTurn === turn) dispatch(setPhase("idle"));
  }
}

/** Close the chat and end the conversation: the next open starts fresh (new greeting, new session). */
export function endChat() {
  turn++;
  controller?.abort();
  voiceBus.stop();
  store.dispatch(setChatOpen(false));
  store.dispatch(resetChat());
}
