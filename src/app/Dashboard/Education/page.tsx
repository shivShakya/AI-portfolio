"use client";
import { useState, useEffect } from "react";
import Tilt from "react-parallax-tilt";

interface EducationPost {
  title: string;
  description: string[];
}

export default function Education() {
  const [blocks, setBlocks] = useState<EducationPost[]>([]);

  useEffect(() => {
    const fetchEducationData = async () => {
      const response = await fetch("/education/education.json");
      const data = await response.json();
      setBlocks(data);
    };

    fetchEducationData();
  }, []); 

  return (
    <div className="flex flex-col justify-start items-center w-full p-8 bg-gradient-to-br h-[100vh] from-[#211516] to-[#0c1f33]">
      <h1 className="text-3xl font-bold text-cyan-50 mb-8">My Education</h1>
      <div className="w-full max-w-5xl">
        {blocks.map((education, index) => (
          <Tilt
            glareEnable={true}
            tiltMaxAngleX={10}
            tiltMaxAngleY={0}
            perspective={500}
            glareColor={"black"}
            key={index}
            className="bg-white p-6 mb-6 shadow-md rounded-md"
          >
            <h2 className="text-xl font-semibold text-gray-800">{education.title}</h2>
            <div className="text-gray-700 mt-4">
              {education.description.map((desc, i) => (
                <p key={i}>- {desc}</p>
              ))}
            </div>
          </Tilt>
        ))}
      </div>
    </div>
  );
}
