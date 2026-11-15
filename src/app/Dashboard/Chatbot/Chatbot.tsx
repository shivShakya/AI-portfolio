"use client";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Maximize2, Minimize2, X } from "lucide-react";
import type { RootState } from "@/redux/store";
import { setChatExpanded } from "@/redux/chatSlice";
import TextBot from "./TextBot/TextBot";
import VoiceBot from "./VoiceBot/VoiceBot";

interface ChatbotProps {
  isHovered: boolean;
  /** "dashboard": the dashboard's chat (closed via its bottom bar).
   *  "floating": the home page chat, with its own close button. */
  variant?: "dashboard" | "floating";
  onClose?: () => void;
}

// Phones/tablets: a bottom sheet a quarter of the screen tall (at least 230px) so the page stays
// visible, expandable to full screen. Desktop: left column (dashboard) or a floating panel (home).
const SHEET = "h-[max(25vh,230px)]";
const CONTAINER = {
  dashboard: {
    sheet: `left-0 right-0 bottom-[68px] ${SHEET} z-[45]`,
    full: "left-0 right-0 top-0 bottom-[68px] z-[45] bg-midnight",
    desktop: "left-0 top-0 bottom-[68px] w-1/4 z-[45] bg-midnight",
  },
  floating: {
    sheet: `left-0 right-0 bottom-0 ${SHEET} z-[110]`,
    full: "inset-0 z-[110] bg-midnight",
    desktop: "bottom-20 right-4 w-[360px] h-[min(720px,calc(100vh-7rem))] z-[110]",
  },
};

export default function Chatbot({ isHovered, variant = "dashboard", onClose }: ChatbotProps) {
  const dispatch = useDispatch();
  const mobile = useSelector((s: RootState) => s.device.value) === "mobile";
  const expanded = useSelector((s: RootState) => s.chat.expanded);
  const floating = variant === "floating";
  const compact = mobile && !expanded;
  const mode = !mobile ? "desktop" : expanded ? "full" : "sheet";

  return (
    <div
      aria-hidden={!isHovered}
      role={floating ? "dialog" : undefined}
      aria-label={floating ? "Chat with Shivam's AI" : undefined}
      className={`fixed ${CONTAINER[variant][mode]} transition-[opacity,transform] duration-300 ease-out ${
        isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {isHovered && (
        <div className={`h-full w-full ${compact ? "px-2 pt-0 pb-2" : mode === "desktop" && floating ? "" : "p-3 sm:p-4"}`}>
          <div
            className={`h-full w-full flex flex-col bg-surface border border-gray-200 shadow-xl overflow-hidden ${
              compact ? "rounded-t-2xl rounded-b-xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)]" : "max-w-xl mx-auto rounded-2xl"
            }`}
          >
            {/* Header (in the compact sheet it carries a small talking avatar) */}
            <div
              className={`flex items-center gap-3 border-b border-gray-200 shrink-0 ${compact ? "px-3 py-1.5" : "py-3"} ${
                compact || floating ? "px-3 sm:px-4" : "pl-4 pr-12 lg:px-4"
              }`}
            >
              {compact ? (
                <div className="relative shrink-0">
                  <VoiceBot modelUrl="./me.glb" compact />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-surface" />
                </div>
              ) : (
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold">S</div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-surface" />
                </div>
              )}
              <div className="leading-tight min-w-0">
                <p className="text-sm font-semibold text-ink truncate">Ask Shivam&apos;s AI</p>
                <p className="text-xs text-gray-500 truncate">Online · usually replies in seconds</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                {mobile && (
                  <button
                    onClick={() => dispatch(setChatExpanded(!expanded))}
                    aria-label={expanded ? "Shrink chat" : "Expand chat"}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
                  >
                    {expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                  </button>
                )}
                {floating && onClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close chat"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Big avatar (desktop and expanded) */}
            {!compact && (
              <div className="flex justify-center pt-3 sm:pt-4 shrink-0">
                <VoiceBot modelUrl="./me.glb" />
              </div>
            )}

            {/* Conversation + input */}
            <div className={`flex-1 min-h-0 ${compact ? "px-2 pt-2" : "px-3 sm:px-4 pb-3 sm:pb-4 pt-3"}`}>
              <TextBot compact={compact} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
