"use client";
import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

export type Origin = { x: number; y: number } | null;

type Props = {
  /** Changing this replays the entrance animation. */
  transitionKey: string;
  /** Viewport point the reveal grows from (the tapped nav button). Null = left edge. */
  origin: Origin;
  children: React.ReactNode;
};

// Section entrance: a teal circle bursts out of the tapped nav button and fills the panel,
// then dissolves while the section's top-level blocks rise in one after another.
export default function PageTransition({ transitionKey, origin, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const ripple = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const burst = ripple.current;
    if (!el || !burst) return;

    // Always start a newly opened section at the top.
    const scroller = el.parentElement;
    if (scroller) scroller.scrollTop = 0;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const visibleH = Math.min(rect.height, scroller?.clientHeight || rect.height, window.innerHeight);
    const ox = origin ? origin.x - rect.left : 0;
    const oy = origin ? origin.y - rect.top : visibleH / 2;
    // Radius that covers the visible area from the origin.
    const radius = Math.max(
      Math.hypot(ox, oy),
      Math.hypot(rect.width - ox, oy),
      Math.hypot(ox, visibleH - oy),
      Math.hypot(rect.width - ox, visibleH - oy)
    );

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const at = `${ox}px ${oy}px`;

      tl.set(burst, { height: visibleH, autoAlpha: 1 })
        .fromTo(
          burst,
          { clipPath: `circle(0px at ${at})` },
          { clipPath: `circle(${radius}px at ${at})`, duration: 0.6, ease: "expo.inOut" }
        )
        .to(burst, { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 0.55);

      // Each section's root element holds its main blocks (heading, grid, list...).
      const section = burst.nextElementSibling; // the section's root element
      const blocks = Array.from(section?.children ?? []).slice(0, 12);
      if (blocks.length) {
        tl.from(
          blocks,
          {
            y: 32,
            autoAlpha: 0,
            filter: "blur(6px)",
            duration: 0.8,
            ease: "expo.out",
            stagger: 0.08,
            clearProps: "transform,filter",
          },
          0.5
        );
      }
    }, ref);

    return () => ctx.revert();
    // Replays only when the section changes; origin is read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionKey]);

  return (
    <div ref={ref} className="relative w-full min-h-full">
      <div
        ref={ripple}
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-20 bg-accent pointer-events-none invisible"
      />
      {children}
    </div>
  );
}
