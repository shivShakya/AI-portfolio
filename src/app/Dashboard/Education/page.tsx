"use client";
import { useEffect, useState } from "react";
import { ChevronDown, GraduationCap } from "lucide-react";
import Expandable from "../ui/Expandable";

interface EducationItem {
  title: string;
  description: string[];
}

export default function Education() {
  const [blocks, setBlocks] = useState<EducationItem[]>([]);
  const [open, setOpen] = useState<number | null>(0); // one open at a time, latest first

  useEffect(() => {
    fetch("/education/education.json")
      .then((r) => r.json())
      .then(setBlocks)
      .catch((e) => console.error("Error loading education:", e));
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-10">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Learning</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">My Education</h1>
        <p className="text-gray-500 mt-2">PG-DAC from CDAC ACTS Pune, M.Sc. from Pune University and B.Sc. from Delhi University.</p>
      </header>

      <div className="space-y-4">
        {blocks.map((ed, i) => {
          const isOpen = open === i;
          const panelId = `edu-panel-${i}`;
          return (
            <div
              key={ed.title}
              className={`rounded-2xl border bg-white transition-all duration-300 ${
                isOpen ? "border-accent/40 shadow-lg" : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
              }`}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full text-left p-5 sm:p-6 flex items-center gap-4 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span
                  className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    isOpen ? "bg-accent text-white" : "bg-accent/10 text-accent"
                  }`}
                >
                  <GraduationCap size={20} />
                </span>
                <h2 className="flex-1 min-w-0 text-base sm:text-lg font-semibold text-gray-900">{ed.title}</h2>
                <span
                  className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen ? "bg-accent text-white rotate-180" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <ChevronDown size={18} />
                </span>
              </button>

              <Expandable open={isOpen} id={panelId}>
                <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-gray-100 space-y-3 text-gray-700 leading-relaxed sm:pl-[5.25rem]">
                  {ed.description.map((d, j) => (
                    <p key={j}>{d}</p>
                  ))}
                </div>
              </Expandable>
            </div>
          );
        })}
      </div>
    </div>
  );
}
