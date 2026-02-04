"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCategory } from "@/redux/categorySlice";
import { setTextResponse } from "@/redux/responseSlice";
import { Loader2, SendHorizontal, Sparkles, User, Cpu } from "lucide-react";
import type { RootState } from "@/redux/store";
import { setPath } from "@/redux/pathSlice";

function TextBot() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [voiceOutput, setVoiceOutput] = useState("");
  const [sessionId] = useState<string>(() =>
    typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
  );

  const dispatch = useDispatch();
  const textResponse = useSelector((state: RootState) => state.response.value);
  const inputText = useSelector((state: RootState) => state.input.value);
  const outputText = useSelector((state: RootState) => state.output.value);
  const device = useSelector((state: RootState) => state.device.value);

  useEffect(() => {
    dispatch(setTextResponse(""));
    setVoiceOutput((prevText) => prevText + " " + outputText);
  }, [outputText]);

  useEffect(() => {
    dispatch(setTextResponse(""));
    setVoiceOutput("User:" + " " + inputText + "\n" + "AI:");
  }, [inputText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, sessionId }),
      });
      if (!res.ok) throw new Error("Failed to fetch response");
      const data = await res.json();
      const response = JSON.parse(data.response);
      
      if (response && response.link) dispatch(setCategory(response.link));
      if (response?.path) {
        dispatch(setPath(response.path.length > 0 ? response.path[0] : ""));
      } else {
        dispatch(setPath(""));
      }
      dispatch(setTextResponse(response.response));
      setInput("");
    } catch (err) {
      setError("I'm having trouble connecting. Try again?");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full gap-5 bg-transparent p-1">
      {/* CHAT DISPLAY AREA - Crisp Light Aesthetic */}
      <div 
        className={`relative border border-slate-200/60 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl transition-all duration-500 ${
          device !== 'mobile' ? 'h-64' : 'h-40'
        } shadow-[0_15px_40px_-15px_rgba(0,0,0,0.08)]`}
      >
        <div className="h-full overflow-y-auto p-5 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-full gap-4">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 bg-indigo-100 rounded-full animate-ping opacity-20" />
                <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Synthesizing...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl text-red-600 text-sm font-medium border border-red-100">
              <span className="text-lg">✕</span> {error}
            </div>
          ) : (
            <div className="space-y-4">
              {(textResponse || voiceOutput) ? (
                <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                    <Cpu size={14} className="text-white" />
                  </div>
                  <p className="text-slate-800 text-sm leading-relaxed font-medium whitespace-pre-wrap py-1">
                    {textResponse || voiceOutput}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full pt-8 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                    <Sparkles className="text-indigo-400" size={20} />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">Ready for your instructions.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* INPUT AREA - High Contrast Minimalism */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your command..."
            className="w-full bg-white border border-slate-200 p-4 pr-14 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm group-hover:shadow-md"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-300 transition-all transform active:scale-90 shadow-md"
          >
            <SendHorizontal size={18} />
          </button>
        </div>

        {/* Dynamic Badge - Added for Drama */}
        <div className="flex justify-center">
          <div className="px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-500">AI Online</span>
          </div>
        </div>
      </form>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}

export default TextBot;