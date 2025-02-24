"use client";
import React from "react";
import Image from "next/image";

export default function Portfolio() {
  return (
    <div className="flex justify-center items-center top-0 left-0 w-full bg-background border border-gray-500 rounded-b-md overflow-hidden transition-all duration-500 ease-in-out cursor-pointer">
      <div className="p-6 pt-20 bg-white border-2 border-customColor overflow-y-auto max-w-4xl mx-auto md:rounded-lg shadow-lg">
        {/* Profile Section */}
        <div className="flex flex-col items-center md:flex-row md:items-start md:gap-6 mb-6">
          <Image
            src="/shivam.jpeg"
            alt="Shivam Shakya"
            width={128}
            height={128}
            className="rounded-full object-cover border-gray-500 shadow-md"
          />
          <div className="text-center md:text-left mt-4 md:mt-0">
            <h1 className="text-2xl font-bold text-customColor">Shivam Shakya</h1>
            <p className="text-gray-600">Software Developer @ VRARMR, Delhi</p>
          </div>
        </div>

        {/* About Section */}
        <div className="text-gray-700 leading-relaxed text-center md:text-left">
          <p>
            Hey, I am Shivam, and this is my portfolio. I work as a software developer at VRARMR, Delhi, India.
            My expertise lies in Full Stack Development, 3D Development, Data Science and AI related field.
          </p>
          <p className="mt-4">
            Over the past few years, I&apos;ve had the opportunity to work on exciting projects, from interactive web applications to
            creating 3D environments and games using Three.js and Unity to Solving Data related problems using Machine learning and deep learning.
          </p>
          <p className="mt-4">
              When I&apos;m not coding, I explore AI trends, read and analyze AI research papers, watch movies, and travel.
          </p>
        </div>
      </div>
    </div>
  );
}
