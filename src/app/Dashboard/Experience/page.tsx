"use client";
import { useEffect, useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import Expandable from "../ui/Expandable";

interface ExperienceItem {
  title: string;
  duration: string;
  description: string[];
}

// "Software Engineer at Meta Design Solutions, Gurugram" -> role / company / place
const parseTitle = (title: string) => {
  const [role, rest] = title.includes(" at ") ? title.split(/ at (.+)/) : [title, ""];
  const [company, ...place] = rest.split(", ");
  return { role, company, place: place.join(", ") };
};

export default function Experience() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [open, setOpen] = useState<Set<number>>(new Set([0])); // latest role open by default

  useEffect(() => {
    fetch("/experience/experience.json")
      .then((r) => r.json())
      .then(setExperiences)
      .catch((e) => console.error("Error loading experience:", e));
  }, []);

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const allOpen = experiences.length > 0 && open.size === experiences.length;
  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(experiences.map((_, i) => i)));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-10">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Career</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">My Experience</h1>
          <p className="text-gray-500 mt-2">3 years across AI, full-stack and immersive 3D.</p>
        </div>
        {experiences.length > 0 && (
          <button
            onClick={toggleAll}
            className="self-start sm:self-auto text-sm font-medium px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:border-accent hover:text-accent transition-colors"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        )}
      </header>

      <ol className="relative">
        <span className="absolute left-[11px] top-3 bottom-3 w-px bg-gray-200" aria-hidden="true" />
        {experiences.map((exp, i) => {
          const { role, company, place } = parseTitle(exp.title);
          const isOpen = open.has(i);
          const isCurrent = i === 0;
          const panelId = `exp-panel-${i}`;
          return (
            <li key={exp.title} className="relative pl-10 pb-5 last:pb-0">
              <span
                aria-hidden="true"
                className={`absolute left-[5px] top-6 w-[13px] h-[13px] rounded-full border-[3px] border-white transition-colors ${
                  isCurrent || isOpen ? "bg-accent" : "bg-gray-300"
                }`}
              />
              {isCurrent && (
                <span className="absolute left-[5px] top-6 w-[13px] h-[13px] rounded-full bg-accent/40 animate-ping" aria-hidden="true" />
              )}

              <div
                className={`rounded-2xl border bg-white transition-all duration-300 ${
                  isOpen ? "border-accent/40 shadow-lg" : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
                }`}
              >
                <button
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full text-left p-5 sm:p-6 flex items-start gap-4 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{role}</h2>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                          Current
                        </span>
                      )}
                    </div>
                    {company && (
                      <p className="text-gray-600 mt-0.5">
                        {company}
                        {place && <span className="text-gray-400"> · {place}</span>}
                      </p>
                    )}
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
                      <Clock size={12} /> {exp.duration}
                    </p>
                  </div>
                  <span
                    className={`mt-1 w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen ? "bg-accent text-white rotate-180" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <ChevronDown size={18} />
                  </span>
                </button>

                <Expandable open={isOpen} id={panelId}>
                  <ul className="px-5 sm:px-6 pb-6 space-y-2.5 border-t border-gray-100 pt-4 mx-0">
                    {exp.description.map((d, j) => (
                      <li key={j} className="flex gap-3 text-gray-700 leading-relaxed">
                        <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </Expandable>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
