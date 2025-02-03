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
      className="relative flex justify-center items-center min-h-screen"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="relative w-80 h-80 md:w-[20vw] md:h-[20vw] rounded-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: dragging ? "none" : "transform 0.5s ease",
        }}
        onMouseDown={handleMouseDown}
      >
        {circlePositions.map((pos, index) => (
          <div
            key={index}
            className="absolute rounded-full  border-2 border-customColor w-12 h-12 md:w-[3vw] md:h-[3vw] cursor-pointer transition-all duration-300 transform-gpu group"
            style={{
              ...pos,
              background: "transparent ",
              color: "#295074"
              
            }}
            onClick={() => onSelectPage(pos.page)}
          >
            <div
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                transform: `rotate(-${rotation}deg)`, 
                whiteSpace: "nowrap",
              }}
            >
              {pos.hoverText}
            </div>

            <div
              className="absolute inset-0 flex items-center justify-center text-customColor font-bold text-lg"
              style={{
                transform: `rotate(-${rotation}deg)`, 
              }}
            >
              {pos.page.charAt(0).toUpperCase()} 
            </div>
          </div>
        ))}
      </div>
      <div className="absolute w-5 h-5 rounded-full border-4 bg-transparent flex justify-center items-center z-20"></div>
    </div>
  );
}
