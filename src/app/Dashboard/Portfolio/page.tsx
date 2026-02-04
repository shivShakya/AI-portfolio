"use client";
import React from "react";
import Image from "next/image";

export default function Portfolio() {
  return (
    // Main container: Removed harsh borders, added responsive padding
    <div className="w-full bg-white pt-24 pb-12 px-6 md:pt-32">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Section */}
        <div className="flex flex-col items-center md:flex-row md:items-center gap-6 md:gap-10 mb-12">
          <div className="relative">
            <Image
              src="/shivam.jpeg"
              alt="Shivam Shakya"
              width={140}
              height={140}
              className="rounded-2xl object-cover grayscale hover:grayscale-0 transition-all duration-500 shadow-sm"
            />
            {/* Subtle accent decoration */}
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gray-50 -z-10 rounded-full" />
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tighter">
              Shivam Shakya
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium mt-2">
              Software Developer <span className="text-gray-300 mx-2">/</span> VRARMR, Delhi
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="space-y-6 text-gray-600">
  <p className="text-xl md:text-2xl leading-tight text-gray-800 font-medium tracking-tight">
    I build web and mobile applications, immersive 3D experiences, and AI-driven solutions.
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
    <p className="leading-relaxed">
      Based in India, I work at the intersection of Full-Stack Development, AI engineering, 
      and immersive 3D experiences using technologies like Three.js and Unity.
    </p>

    <p className="leading-relaxed">
      I recently completed a professional course from CDAC, where I gained hands-on, 
      industry-level experience building full-stack applications using Spring Boot, 
      Microservices, Kafka, Redis, MERN stack, and .NET.
    </p>

    <p className="leading-relaxed">
      When I&apos;m not coding, I enjoy deep-diving into AI research papers and exploring new ideas. 
      I thrive on solving complex data problems using Machine Learning.
    </p>

    <p className="leading-relaxed">
      During college, I was actively involved in theatre, which helped me develop strong 
      soft skills such as leadership, communication, a result-oriented mindset, and a 
      strong can-do attitude.
    </p>
  </div>
</div>

        </div>

        {/* Subtle Divider */}
        <div className="mt-16 border-t border-gray-100 w-full" />
      </div>
  );
}