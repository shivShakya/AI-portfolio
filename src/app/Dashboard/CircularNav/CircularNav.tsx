"use client";
import { useState } from "react";

type CircularNavProps = {
  onSelectPage: (page: string) => void; 
};

export default function CircularNav({ onSelectPage }: CircularNavProps) {
  const [rotation, setRotation] = useState<number>(0);
  const [dragging, setDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);

  const handleMouseDown = (e: React.MouseEvent): void => {
    setDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent): void => {
    if (!dragging) return;

    const deltaX = e.clientX - startX;
    setRotation((prev) => prev + deltaX / 2);
    setStartX(e.clientX);
  };

  const handleMouseUp = (): void => setDragging(false);

  // LOGIC: Purely your original positions
  const circlePositions = [
    { top: "10%", left: "50%", transform: "translate(-50%, -50%)", page: "blog", hoverText: "Blog" },
    { top: "20%", left: "80%", transform: "translate(-50%, -50%)", page: "project", hoverText: "Projects" },
    { top: "50%", left: "90%", transform: "translate(-50%, -50%)", page: "skills", hoverText: "Skills" },
    { bottom: "20%", left: "80%", transform: "translate(-50%, 50%)", page: "experience", hoverText: "Experience" },
    { bottom: "10%", left: "50%", transform: "translate(-50%, 50%)", page: "contact", hoverText: "Contact" },
    { bottom: "20%", left: "20%", transform: "translate(-50%, 50%)", page: "education", hoverText: "Education" },
    { top: "50%", left: "10%", transform: "translate(-50%, -50%)", page: "portfolio", hoverText: "Portfolio" },
    { top: "20%", left: "20%", transform: "translate(-50%, -50%)", page: "resume", hoverText: "Resume" },
  ];

  return (
    <div
      className="relative flex justify-center items-center min-h-screen select-none overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Dynamic Background Ring - Added for drama */}
      <div className="absolute w-80 h-80 md:w-[20vw] md:h-[20vw] border border-slate-200/50 rounded-full pointer-events-none" />
      
      <div
        className="relative w-80 h-80 md:w-[20vw] md:h-[20vw] rounded-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: dragging ? "none" : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        onMouseDown={handleMouseDown}
      >
        {circlePositions.map((pos, index) => (
          <div
            key={index}
            className="absolute rounded-full border-2 border-slate-200 bg-white w-12 h-12 md:w-[3.5vw] md:h-[3.5vw] cursor-pointer transition-all duration-300 group shadow-sm hover:z-50 hover:border-indigo-500 hover:bg-indigo-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)]"
            style={{
              ...pos,
            }}
            onClick={() => onSelectPage(pos.page)}
          >
            {/* Tooltip highlighting on hover */}
            <div
              className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 text-[10px] font-bold bg-slate-900 text-white rounded opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-y-1"
              style={{
                transform: `rotate(${-rotation}deg) translateX(-50%)`, 
                whiteSpace: "nowrap",
              }}
            >
              {pos.hoverText}
            </div>

            {/* Letter highlighting on hover */}
            <div
              className="absolute inset-0 flex items-center justify-center text-slate-500 group-hover:text-white font-bold text-lg md:text-xl transition-all"
              style={{
                transform: `rotate(${-rotation}deg)`, 
              }}
            >
              {pos.page.charAt(0).toUpperCase()} 
            </div>
          </div>
        ))}
      </div>

      {/* Dramatic Center Hub - Professional Dark Look */}
      <div className="absolute pointer-events-none flex items-center justify-center">
        {/* Static Glow */}
        <div className="absolute w-24 h-24 bg-indigo-500/10 blur-xl rounded-full animate-pulse" />
        
        <div className="relative w-16 h-16 rounded-full bg-[#111827] border-[4px] border-white shadow-xl flex items-center justify-center">
            {/* Active Core */}
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8]" />
        </div>
      </div>
    </div>
  );
}