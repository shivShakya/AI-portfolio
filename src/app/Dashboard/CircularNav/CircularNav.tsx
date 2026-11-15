"use client";
import { useEffect, useRef, useState } from "react";

type CircularNavProps = {
  onSelectPage: (page: string, origin?: { x: number; y: number }) => void;
  activePage?: string;
};

const ITEMS = [
  { page: "blog", label: "Blog" },
  { page: "project", label: "Projects" },
  { page: "skills", label: "Skills" },
  { page: "experience", label: "Experience" },
  { page: "contact", label: "Contact" },
  { page: "education", label: "Education" },
  { page: "portfolio", label: "Portfolio" },
  { page: "resume", label: "Resume" },
];

const STEP = 360 / ITEMS.length;
const RADIUS = 40; // % of the ring size, from centre to each button
const DRAG_THRESHOLD = 6; // px moved before a press counts as a drag, not a click
const FRICTION = 0.94; // momentum decay per frame after release

// Angle (degrees, 0 = top, clockwise) of a pointer relative to an element's centre.
const angleFrom = (el: HTMLElement, x: number, y: number) => {
  const r = el.getBoundingClientRect();
  return (Math.atan2(x - (r.left + r.width / 2), -(y - (r.top + r.height / 2))) * 180) / Math.PI;
};

// Smallest signed difference between two angles, so crossing 180/-180 doesn't jump.
const angleDelta = (a: number, b: number) => ((a - b + 540) % 360) - 180;

// Rotation-hint arrows drawn inside the ring, between the hub and the buttons (viewBox 0..100).
// Angles: 0 = top, clockwise. Each arrow is an arc plus a chevron tip in one path.
const ARROW_R = 25.5; // hub edge is ~19%, button inner edge ~32%
const xy = (deg: number, r = ARROW_R) => {
  const a = (deg * Math.PI) / 180;
  return [50 + r * Math.sin(a), 50 - r * Math.cos(a)];
};
const f2 = (n: number) => n.toFixed(2);
const arrowPath = (from: number, to: number) => {
  const [sx, sy] = xy(from);
  const [ex, ey] = xy(to);
  const a = (to * Math.PI) / 180;
  const tx = Math.cos(a), ty = Math.sin(a); // clockwise tangent at the tip
  const nx = Math.sin(a), ny = -Math.cos(a); // outward normal at the tip
  const L = 2.6, W = 2.2; // chevron length / half-width
  const [l1x, l1y] = [ex - tx * L + nx * W, ey - ty * L + ny * W];
  const [l2x, l2y] = [ex - tx * L - nx * W, ey - ty * L - ny * W];
  return `M ${f2(sx)} ${f2(sy)} A ${ARROW_R} ${ARROW_R} 0 0 1 ${f2(ex)} ${f2(ey)} M ${f2(l1x)} ${f2(l1y)} L ${f2(ex)} ${f2(ey)} L ${f2(l2x)} ${f2(l2y)}`;
};
// Two long arcs, like a "rotate" icon around the hub.
const ARROWS: [number, number][] = [
  [25, 155],
  [205, 335],
];

export default function CircularNav({ onSelectPage, activePage }: CircularNavProps) {
  const ringRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);

  const drag = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    lastAngle: 0,
    velocity: 0,
    lastTime: 0,
  });
  const frame = useRef<number | null>(null);

  const stopMomentum = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  };

  useEffect(() => stopMomentum, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!ringRef.current) return;
    stopMomentum();
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      lastAngle: angleFrom(ringRef.current, e.clientX, e.clientY),
      velocity: 0,
      lastTime: performance.now(),
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active || !ringRef.current) return;

    if (!d.moved) {
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < DRAG_THRESHOLD) return;
      d.moved = true;
      setIsDragging(true);
      setHasSpun(true);
      ringRef.current.setPointerCapture(e.pointerId);
    }

    const angle = angleFrom(ringRef.current, e.clientX, e.clientY);
    const delta = angleDelta(angle, d.lastAngle);
    const now = performance.now();
    const dt = Math.max(now - d.lastTime, 1);
    d.velocity = (delta / dt) * 16; // degrees per ~frame
    d.lastAngle = angle;
    d.lastTime = now;
    setRotation((r) => r + delta);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (ringRef.current?.hasPointerCapture(e.pointerId)) {
      ringRef.current.releasePointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    setIsDragging(false);
    // Let the click that follows this release be ignored, then accept clicks again.
    setTimeout(() => {
      drag.current.moved = false;
    }, 0);

    // Glide to a stop after release.
    let v = d.velocity;
    const glide = () => {
      v *= FRICTION;
      if (Math.abs(v) < 0.05) {
        frame.current = null;
        return;
      }
      setRotation((r) => r + v);
      frame.current = requestAnimationFrame(glide);
    };
    frame.current = requestAnimationFrame(glide);
  };

  const handleSelect = (page: string, el: HTMLElement) => {
    // A drag that ends on a button shouldn't open it.
    if (drag.current.moved) return;
    const r = el.getBoundingClientRect();
    onSelectPage(page, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  const hubLabel =
    ITEMS.find((i) => i.page === hovered)?.label ??
    ITEMS.find((i) => i.page === activePage)?.label ??
    "Explore";
  const hubIsHover = hovered !== null && hovered !== activePage;

  return (
    <div className="relative flex justify-center items-center min-h-screen select-none">
      <div
        ref={ringRef}
        className={`relative w-[min(80vw,340px)] h-[min(80vw,340px)] md:w-[min(62vw,480px)] md:h-[min(62vw,480px)] lg:w-[clamp(220px,20vw,380px)] lg:h-[clamp(220px,20vw,380px)] rounded-full touch-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Track */}
        <div className="absolute inset-[10%] rounded-full border border-dashed border-gray-300 pointer-events-none" />

        {/* Rotation arrows. The arrows circle the hub inside the ring and turn with it. */}
        <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none">
          <g
            className={`text-accent transition-opacity duration-700 ${hasSpun ? "opacity-0" : "opacity-90"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {ARROWS.map(([from, to]) => (
              <path key={from} d={arrowPath(from + rotation, to + rotation)} />
            ))}
          </g>
        </svg>

        {ITEMS.map((item, index) => {
          const rad = ((index * STEP + rotation) * Math.PI) / 180;
          const left = 50 + RADIUS * Math.sin(rad);
          const top = 50 - RADIUS * Math.cos(rad);
          const isActive = item.page === activePage;
          const isHovered = item.page === hovered;

          return (
            <button
              key={item.page}
              type="button"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              onClick={(e) => handleSelect(item.page, e.currentTarget)}
              onPointerEnter={() => setHovered(item.page)}
              onPointerLeave={() => setHovered((h) => (h === item.page ? null : h))}
              onFocus={() => setHovered(item.page)}
              onBlur={() => setHovered(null)}
              className={`absolute w-12 h-12 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] md:text-2xl lg:w-[clamp(44px,3.5vw,60px)] lg:h-[clamp(44px,3.5vw,60px)] rounded-full border-2 flex items-center justify-center font-bold text-lg lg:text-xl outline-none focus-visible:ring-2 focus-visible:ring-accent transition-[background-color,border-color,color,box-shadow,transform] duration-200 ${
                isActive
                  ? "bg-accent border-accent text-white shadow-[0_0_0_6px_rgb(var(--accent)/0.18),0_8px_20px_rgb(var(--accent)/0.35)] z-20"
                  : isHovered
                  ? "bg-surface border-accent text-accent shadow-lg z-10"
                  : "bg-surface border-gray-300 text-gray-500 shadow-sm"
              }`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: `translate(-50%, -50%) scale(${isActive || isHovered ? 1.12 : 1})`,
                cursor: isDragging ? "grabbing" : "pointer",
              }}
            >
              {item.label.charAt(0)}
            </button>
          );
        })}

        {/* Centre hub: shows the hovered or selected section, never clipped */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-36 h-36 rounded-full bg-accent/10 blur-2xl" />
          <div
            className={`relative w-28 h-28 sm:w-32 sm:h-32 md:w-44 md:h-44 lg:w-[clamp(104px,7.5vw,136px)] lg:h-[clamp(104px,7.5vw,136px)] rounded-full bg-surface border-[3px] flex flex-col items-center justify-center text-center shadow-xl transition-colors duration-200 ${
              activePage || hovered ? "border-accent" : "border-gray-300"
            }`}
          >
            <span className="text-[9px] sm:text-[10px] md:text-xs lg:text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
              {hubIsHover ? "Open" : activePage ? "Viewing" : "Drag to spin"}
            </span>
            <span
              key={hubLabel}
              className="mt-1 px-2 text-sm sm:text-base md:text-xl lg:text-base font-bold text-ink leading-tight animate-[hubfade_200ms_ease-out]"
            >
              {hubLabel}
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes hubfade {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
