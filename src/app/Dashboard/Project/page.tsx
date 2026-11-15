"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { setPath } from "@/redux/pathSlice";
import { useDispatch } from "react-redux";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  categories?: string[];
}

export default function Project() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState("All");
  const dispatch = useDispatch();

  useEffect(() => {
    fetch("/projects/projects.json")
      .then((r) => r.json())
      .then(setProjects)
      .catch((e) => console.error("Error loading projects:", e));
  }, []);

  const filters = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => p.categories?.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1)));
    return [["All", projects.length] as const, ...Array.from(counts.entries())];
  }, [projects]);

  const shown = filter === "All" ? projects : projects.filter((p) => p.categories?.includes(filter));
  const open = (id: string) => dispatch(setPath(`${id}-${Date.now()}`));

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Work</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">My Projects</h1>
        <p className="text-gray-500 mt-2">Things I&apos;ve built, from AI systems to virtual worlds. Tap any project for details.</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-8 -mx-1 px-1 scrollbar-hide" role="tablist" aria-label="Project categories">
        {filters.map(([name, count]) => {
          const selected = filter === name;
          return (
            <button
              key={name}
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(name)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                selected
                  ? "bg-accent border-accent text-white shadow-md"
                  : "bg-white border-gray-300 text-gray-700 hover:border-accent hover:text-accent"
              }`}
            >
              {name}
              <span className={`text-xs px-1.5 rounded-full ${selected ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div key={filter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shown.map((project, i) => (
          <button
            key={project.id}
            onClick={() => open(project.id)}
            aria-label={`Open ${project.title}`}
            className="group text-left flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-300 animate-[projIn_500ms_cubic-bezier(0.16,1,0.3,1)_backwards]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                unoptimized
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000]/70 via-[#000]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-sm font-semibold text-[#fff] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                View project <ArrowUpRight size={16} />
              </span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.categories?.map((c) => (
                  <span key={c} className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-accent/10 text-accent">
                    {c}
                  </span>
                ))}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-accent transition-colors">{project.title}</h3>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{project.description}</p>
              <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                Details <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <style jsx global>{`
        @keyframes projIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
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
