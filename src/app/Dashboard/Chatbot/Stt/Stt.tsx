"use client";

// Hands-free mic using the browser's own speech recognition (Chrome, Edge, Safari).
// Turn it on once, then just talk: each finished sentence is sent with askAI().
// The mic pauses while the avatar speaks so it never hears (and answers) its own voice.
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Mic, MicOff } from "lucide-react";
import { store } from "@/redux/store";
import { setVoiceOn } from "@/redux/chatSlice";
import { voiceBus } from "../voiceBus";
import { askAI } from "../chatClient";

export type MicStatus = "off" | "listening" | "hearing" | "speaking" | "error";

// Minimal typing for the Web Speech API (not in TypeScript's DOM lib).
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type RecognitionCtor = new () => Recognition;

const getRecognition = (): RecognitionCtor | undefined => {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
};

export const micSupported = () => !!getRecognition();

const words = (s: string) => s.toLowerCase().match(/[\p{L}\p{N}']+/gu) || [];

// Dev-only trace of what the mic does (open the browser console to see it).
const log = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== "production") console.log("[mic]", ...args);
};

// True if what the mic heard is mostly the avatar's last answer coming through the speakers.
// Only checked for a few seconds after the avatar stops, so normal questions that share words
// with an earlier answer (or the greeting) are never thrown away.
const isEcho = (heard: string) => {
  if (voiceBus.sinceLastSpoke() > 4000) return false;
  const last = [...store.getState().chat.messages].reverse().find((m) => m.role === "assistant")?.text ?? "";
  const h = words(heard);
  if (!h.length || !last) return false;
  const a = new Set(words(last));
  return h.filter((w) => a.has(w)).length / h.length >= 0.6;
};

interface SttProps {
  /** Turn the mic on as soon as the chat opens. */
  autoStart?: boolean;
  onStatus?: (status: MicStatus, message?: string) => void;
}

const Stt: React.FC<SttProps> = ({ autoStart, onStatus }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<MicStatus>("off");
  const [heard, setHeard] = useState(""); // live words while you speak
  const [message, setMessage] = useState<string | undefined>();
  const [supported, setSupported] = useState(true);

  const recRef = useRef<Recognition | null>(null);
  const activeRef = useRef(false);
  const statusRef = useRef<MicStatus>("off");
  const pausedRef = useRef(false); // mic paused while the avatar talks
  const ignoreUntil = useRef(0); // drop late results that arrive right after resuming
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = (s: MicStatus, msg?: string) => {
    statusRef.current = s;
    setStatus(s);
    setMessage(msg);
  };

  // While you're mid-sentence, show "hearing" with your live words.
  const shown: MicStatus = heard && status === "listening" ? "hearing" : status;
  useEffect(() => {
    onStatus?.(shown, shown === "hearing" ? heard : message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, heard, message]);

  const showError = (msg: string) => {
    update("error", msg);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => {
      if (statusRef.current === "error") update(activeRef.current ? "listening" : "off");
    }, 3500);
  };

  // Avatar speaking: pause the mic. Finished: resume it after a short gap.
  useEffect(
    () =>
      voiceBus.subscribe((speaking) => {
        if (!activeRef.current) return;
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
        if (speaking) {
          log("paused while the avatar speaks");
          pausedRef.current = true;
          setHeard("");
          recRef.current?.abort(); // abort also discards anything half-recognised
          update("speaking");
        } else {
          resumeTimer.current = setTimeout(() => {
            if (!activeRef.current) return;
            pausedRef.current = false;
            ignoreUntil.current = Date.now() + 700;
            try {
              recRef.current?.start();
              log("resumed after the avatar finished");
            } catch (err) {
              log("resume failed:", err);
            }
            if (statusRef.current === "speaking") update("listening");
          }, 400);
        }
      }),
    []
  );

  const start = () => {
    const Ctor = getRecognition();
    if (!Ctor || activeRef.current) return;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN"; // Indian English: better with Hinglish and Indian names

    rec.onresult = (e) => {
      if (recRef.current !== rec) return; // an old, stopped recognizer
      // While the avatar talks (or just after), anything heard is its own voice.
      if (pausedRef.current || Date.now() < ignoreUntil.current) return;
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (interim.trim() && !isEcho(interim)) setHeard(interim.trim());

      const text = final.trim();
      if (!text) return;
      setHeard("");
      if (isEcho(text)) return log("ignored (echo of the avatar):", text);
      if (words(text).length < 2 && text.length < 4) return log("ignored (too short):", text);
      log("heard:", text);
      askAI(text);
    };

    rec.onerror = (e) => {
      if (recRef.current !== rec) return;
      log("error:", e.error);
      if (e.error === "no-speech" || e.error === "aborted") return; // normal pauses
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        activeRef.current = false;
        dispatch(setVoiceOn(false));
        showError("Microphone access was blocked. Allow it in your browser to talk.");
        return;
      }
      console.warn("Speech recognition error:", e.error);
      if (e.error === "network") showError("Speech recognition needs an internet connection.");
    };

    // Browsers end recognition after a while; keep it going until the visitor turns it off.
    rec.onend = () => {
      // Only the current recognizer may restart itself, never one that was stopped.
      if (recRef.current !== rec || !activeRef.current || pausedRef.current) return;
      log("restarting after browser ended recognition");
      try {
        rec.start();
      } catch (err) {
        log("restart failed:", err);
      }
    };

    recRef.current = rec;
    activeRef.current = true;
    pausedRef.current = false;
    dispatch(setVoiceOn(true));

    // The avatar is already talking (e.g. the welcome): wait, the voiceBus listener starts us after.
    const reply = voiceBus.current();
    if (reply && !reply.paused) {
      pausedRef.current = true;
      log("waiting for the avatar to finish before listening");
      update("speaking");
      return;
    }

    try {
      rec.start();
      log("started (lang en-IN)");
      update("listening");
    } catch (e) {
      console.error("Mic start failed:", e);
      activeRef.current = false;
      dispatch(setVoiceOn(false));
      showError("Couldn't start the microphone.");
    }
  };

  const stop = () => {
    activeRef.current = false;
    pausedRef.current = false;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    dispatch(setVoiceOn(false));
    voiceBus.stop();
    setHeard("");
    recRef.current?.abort();
    recRef.current = null;
    update("off");
  };

  useEffect(() => {
    const ok = !!getRecognition();
    setSupported(ok);
    // Deferred so React's dev double-run (mount, unmount, mount) starts the mic only once.
    const startTimer = ok && autoStart ? setTimeout(start, 50) : null;
    // Release the mic when the chat closes.
    return () => {
      if (startTimer) clearTimeout(startTimer);
      activeRef.current = false;
      store.dispatch(setVoiceOn(false));
      recRef.current?.abort();
      recRef.current = null;
      if (errorTimer.current) clearTimeout(errorTimer.current);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!supported) return null;

  const active = status !== "off" && status !== "error";

  return (
    <button
      type="button"
      onClick={() => (active ? stop() : start())}
      aria-label={active ? "Turn off voice chat" : "Turn on voice chat"}
      aria-pressed={active}
      title={active ? "Voice chat on, tap to turn off" : "Talk to the AI (hands-free)"}
      className={`relative w-11 h-11 shrink-0 flex items-center justify-center rounded-full border transition ${
        active
          ? "bg-accent border-accent text-white"
          : "bg-surface border-gray-300 text-gray-600 hover:border-accent hover:text-accent"
      }`}
    >
      {/* Pulses while it hears you */}
      {shown === "hearing" && <span aria-hidden="true" className="absolute inset-0 rounded-full bg-accent/40 animate-ping" />}
      <span className="relative">{active ? <Mic size={18} /> : <MicOff size={18} />}</span>
    </button>
  );
};

export default Stt;
