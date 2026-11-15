"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowUpRight, SendHorizontal } from "lucide-react";
import { store, type RootState } from "@/redux/store";
import { greet, setChatExpanded } from "@/redux/chatSlice";
import Stt, { micSupported, type MicStatus } from "../Stt/Stt";
import { askAI, playGreeting, GREETING } from "../chatClient";

const SUGGESTIONS = [
  "What's your work experience?",
  "Show me your projects",
  "What are your top skills?",
  "How can I contact you?",
];

function TextBot({ compact = false }: { compact?: boolean }) {
  const dispatch = useDispatch();
  const { messages, phase } = useSelector((s: RootState) => s.chat);
  const expanded = useSelector((s: RootState) => s.chat.expanded);
  const [input, setInput] = useState("");
  const [mic, setMic] = useState<{ status: MicStatus; message?: string }>({ status: "off" });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Welcome once per session: show it, and say it if the mic came on.
  // Reads the live store (not the render value) so React's dev double-run can't greet twice.
  useEffect(() => {
    if (store.getState().chat.greeted) return;
    dispatch(greet(GREETING.text)); // the store itself refuses a second greeting
    playGreeting(); // saved audio: plays right away, no API call
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, phase]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || phase === "thinking") return;
    setInput("");
    askAI(q);
  };

  const hasAsked = messages.some((m) => m.role === "user");
  const micOn = mic.status !== "off" && mic.status !== "error";

  // One status line for voice mode.
  const statusText =
    mic.status === "error"
      ? mic.message
      : !micOn
      ? null
      : mic.status === "speaking"
      ? "Speaking… I'll listen again when I'm done"
      : phase === "thinking"
      ? "Thinking…"
      : phase === "voicing"
      ? "Getting my voice ready…"
      : mic.status === "hearing" && mic.message
      ? `“${mic.message}”`
      : "Listening… just start talking";

  return (
    <div className={`flex flex-col h-full w-full ${compact ? "gap-2" : "gap-3"}`}>
      {/* Conversation */}
      <div
        ref={scrollRef}
        className={`flex-1 min-h-0 overflow-y-auto rounded-xl bg-gray-50 border border-gray-200 custom-scrollbar ${compact ? "p-2" : "p-3 sm:p-4"}`}
        aria-live="polite"
      >
        <div className="flex flex-col gap-3">
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="self-end max-w-[85%] rounded-2xl rounded-br-md bg-accent text-white px-3.5 py-2 text-sm leading-relaxed animate-[msgIn_250ms_ease-out]">
                {m.text}
              </div>
            ) : m.role === "event" ? (
              <div key={m.id} className="self-center flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 text-accent pl-3 pr-1.5 py-1 text-xs font-medium animate-[msgIn_250ms_ease-out]">
                <ArrowUpRight size={14} />
                <span>{m.text}</span>
                {expanded ? (
                  <button
                    onClick={() => dispatch(setChatExpanded(false))} // back to the sheet, page visible
                    className="ml-1 rounded-full bg-accent text-white px-2.5 py-0.5 hover:opacity-90"
                  >
                    View
                  </button>
                ) : (
                  <span className="pr-1.5" />
                )}
              </div>
            ) : m.role === "error" ? (
              <div key={m.id} className="self-start max-w-[90%] rounded-2xl rounded-bl-md px-3.5 py-2 text-sm bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
                {m.text}
              </div>
            ) : (
              <div key={m.id} className="self-start max-w-[90%] rounded-2xl rounded-bl-md bg-surface border border-gray-200 px-3.5 py-2 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap animate-[msgIn_250ms_ease-out]">
                {m.text}
              </div>
            )
          )}

          {phase === "thinking" && (
            <div className="self-start flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-surface border border-gray-200 px-4 py-3">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
            </div>
          )}

          {!hasAsked && phase === "idle" && (
            <div className="w-full flex flex-col items-center gap-2 pt-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="w-full max-w-[16rem] text-sm px-4 py-2 rounded-full border border-gray-300 bg-surface text-gray-700 hover:border-accent hover:text-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Voice status */}
      {statusText && (
        <div
          role="status"
          className={`shrink-0 -mb-1 flex items-center justify-center gap-2 text-xs font-medium ${
            mic.status === "error" ? "text-red-600 dark:text-red-400" : "text-accent"
          }`}
        >
          {mic.status !== "error" && (
            <span className={`w-2 h-2 rounded-full bg-accent ${mic.status === "hearing" ? "animate-ping" : "animate-pulse"}`} />
          )}
          <span className="truncate max-w-[90%]">{statusText}</span>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={micSupported() ? "Talk, or type here…" : "Ask about Shivam..."}
          aria-label="Message"
          className="flex-1 min-w-0 h-11 bg-surface border border-gray-300 px-4 rounded-full text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition"
        />
        <Stt autoStart onStatus={(status, message) => setMic({ status, message })} />
        <button
          type="submit"
          aria-label="Send"
          disabled={phase === "thinking" || !input.trim()}
          className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-accent text-white hover:opacity-90 disabled:opacity-40 transition active:scale-95"
        >
          <SendHorizontal size={18} />
        </button>
      </form>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(var(--n-300));
          border-radius: 20px;
        }
      `}</style>
      <style jsx global>{`
        @keyframes msgIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}

export default TextBot;
