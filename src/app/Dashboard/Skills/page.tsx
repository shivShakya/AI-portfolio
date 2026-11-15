"use client";
import { useEffect, useMemo, useState } from "react";
import { Brain, Database, Layers, Search, Wrench, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SkillCategory {
  title: string;
  skills: string[];
}

const ICONS: LucideIcon[] = [Layers, Database, Brain, Wrench];

export default function Skills() {
  const [skillsData, setSkillsData] = useState<SkillCategory[]>([]);
  const [active, setActive] = useState<number | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/skills/skills.json")
      .then((r) => r.json())
      .then((data: SkillCategory[]) => setSkillsData(data))
      .catch((e) => console.error("Error fetching skills data:", e));
  }, []);

  const total = skillsData.reduce((n, c) => n + c.skills.length, 0);
  const q = query.trim().toLowerCase();

  const visible = useMemo(
    () =>
      skillsData
        .map((c, i) => ({ ...c, index: i }))
        .filter((c) => active === "all" || c.index === active)
        .map((c) => ({ ...c, skills: q ? c.skills.filter((s) => s.toLowerCase().includes(q)) : c.skills }))
        .filter((c) => c.skills.length > 0),
    [skillsData, active, q]
  );

  const tabs: { key: number | "all"; label: string; count: number }[] = [
    { key: "all", label: "All", count: total },
    ...skillsData.map((c, i) => ({ key: i, label: c.title, count: c.skills.length })),
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Toolbox</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Technical Expertise</h1>
        <p className="text-gray-500 mt-2">{total} tools and concepts I work with. Filter or search below.</p>
      </header>

      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a skill, e.g. Redis"
            aria-label="Search skills"
            className="w-full h-11 pl-10 pr-10 rounded-full bg-white border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide" role="tablist" aria-label="Skill categories">
          {tabs.map((t) => {
            const selected = active === t.key;
            return (
              <button
                key={String(t.key)}
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(t.key)}
                className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  selected
                    ? "bg-accent border-accent text-white shadow-md"
                    : "bg-white border-gray-300 text-gray-700 hover:border-accent hover:text-accent"
                }`}
              >
                {t.label}
                <span className={`text-xs px-1.5 rounded-full ${selected ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-600">No skills match &ldquo;{query}&rdquo;.</p>
          <button onClick={() => setQuery("")} className="mt-3 text-sm font-medium text-accent hover:underline">
            Clear search
          </button>
        </div>
      ) : (
        <div key={`${active}|${q}`} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visible.map((cat, ci) => {
            const Icon = ICONS[cat.index % ICONS.length];
            return (
              <section
                key={cat.title}
                className="group p-6 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-accent/40 transition-all duration-300 animate-[skillIn_500ms_cubic-bezier(0.16,1,0.3,1)_backwards]"
                style={{ animationDelay: `${ci * 70}ms` }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                    <Icon size={20} />
                  </span>
                  <h2 className="font-semibold text-gray-900">{cat.title}</h2>
                  <span className="ml-auto text-xs text-gray-400">{cat.skills.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <span
                      key={skill}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-sm cursor-default ${
                        q ? "bg-accent/10 border-accent/40 text-accent" : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        @keyframes skillIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
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
