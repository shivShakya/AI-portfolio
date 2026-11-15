"use client";
import React from "react";

// Smooth height animation without measuring: grid rows 0fr -> 1fr.
export default function Expandable({
  open,
  id,
  children,
}: {
  open: boolean;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
