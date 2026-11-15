"use client";
import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { Briefcase, Code2, GraduationCap, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PROGRAMMING = ["Java", "JavaScript", "Python", "C++"];
const SKILLS = ["AI", "Machine Learning", "Full Stack Development", "3D", "AWS"];

const EXPERIENCE = [
  { role: "Software Engineer", org: "Meta Design Solutions", place: "Gurugram", current: true },
  { role: "3D Full Stack Developer", org: "VRARMR", place: "Delhi" },
  { role: "Full Stack Intern", org: "Renderpub", place: "Bengaluru" },
];

const EDUCATION = [
  { title: "PG Diploma (DAC)", org: "CDAC ACTS, Pune" },
  { title: "Master's Degree", org: "Pune University" },
  { title: "Bachelor's Degree", org: "University of Delhi" },
];

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card group h-full flex flex-col p-5 sm:p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-accent/40 transition-[box-shadow,transform,border-color] duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div className="card-icon w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
          <Icon size={20} />
        </div>
        <h3 className="card-title text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="card-item px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 hover:border-accent/50 hover:text-accent transition-colors duration-200"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

const Layout = () => {
  const root = useRef<HTMLDivElement>(null);

  // useLayoutEffect sets the hidden start state before the first paint, so nothing flashes.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".card");
      const tl = gsap.timeline({ delay: 0.45, defaults: { ease: "expo.out" } }); // after the profile intro

      tl.from(cards, {
        autoAlpha: 0,
        y: 48,
        scale: 0.96,
        filter: "blur(8px)",
        duration: 1.1,
        stagger: 0.12,
        clearProps: "transform,filter", // let the CSS hover lift work afterwards
      });

      cards.forEach((card, i) => {
        const at = 0.25 + i * 0.12; // start each card's contents as the card settles
        tl.from(
          card.querySelector(".card-icon"),
          { scale: 0.4, rotate: -20, autoAlpha: 0, duration: 0.7, ease: "back.out(2.2)", clearProps: "transform" },
          at
        )
          .from(card.querySelector(".card-title"), { x: -10, autoAlpha: 0, duration: 0.6 }, at + 0.05)
          .from(
            card.querySelectorAll(".card-item"),
            { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.06 },
            at + 0.15
          );
        const line = card.querySelector(".card-line");
        if (line) tl.from(line, { scaleY: 0, duration: 0.9, ease: "power2.inOut" }, at + 0.15);
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="w-full p-4 sm:p-6 md:absolute bottom-20 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        <Card icon={Code2} title="Programming">
          <Tags items={PROGRAMMING} />
        </Card>

        <Card icon={Layers} title="Skills">
          <Tags items={SKILLS} />
        </Card>

        <Card icon={Briefcase} title="Work Experience">
          <ol className="relative ml-1.5 space-y-4">
            <span className="card-line absolute left-0 top-1 bottom-1 w-px bg-gray-200 origin-top" />
            {EXPERIENCE.map((job) => (
              <li key={job.org} className="card-item pl-4 relative">
                {job.current && (
                  <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent/50 animate-ping" />
                )}
                <span
                  className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    job.current ? "bg-accent" : "bg-gray-300"
                  }`}
                />
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{job.role}</p>
                  {job.current && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 leading-snug">
                  {job.org} · {job.place}
                </p>
              </li>
            ))}
          </ol>
        </Card>

        <Card icon={GraduationCap} title="Education">
          <ul className="space-y-3">
            {EDUCATION.map((ed) => (
              <li key={ed.title} className="card-item flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{ed.title}</p>
                  <p className="text-sm text-gray-500 leading-snug">{ed.org}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Layout;
