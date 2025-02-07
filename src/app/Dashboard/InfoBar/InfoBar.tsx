"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function InfoBar() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`fixed z-30 top-0 left-0 w-full md:w-1/4 bg-background border border-gray-500 rounded-b-md overflow-hidden transition-all duration-500 ease-in-out cursor-pointer ${
        isHovered ? "h-screen" : "h-16"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div
          className="p-6 pt-20 text-customColor bg-white border-2 border-customColor overflow-y-auto"
          style={{ scrollBehavior: "smooth", maxHeight: "calc(100vh - 64px)" }}
        >
          <div className="flex items-center justify-start mb-6">
            <Image
              src="/shivam.jpeg" 
              alt="Shivam Shakya"
              width={128}
              height={128}
              className="rounded-full object-cover border-gray-500"
            />
          </div>

          <p className="leading-relaxed">
            Hey I am Shivam and this is my portfolio. I am working as a
            software developer in VRARMR, Delhi, India. My expertise lies in AI
            Development, 3D Development, and many more.
          </p>
          <p className="leading-relaxed mt-4">
            Over the past few years, I&apos;ve had the opportunity to work on
            several exciting projects, from building interactive web
            applications to creating 3D environments and games using Unity,
            Unreal Engine, and Three.js.
          </p>
          <p className="leading-relaxed mt-4">
            When I&apos;m not coding or designing, you can find me exploring new
            gaming trends, experimenting with virtual reality, or learning new
            software like Blender for 3D modeling.
          </p>
        </div>
      )}
    </div>
  );
}
