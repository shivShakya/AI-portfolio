"use client"
import { useState, useEffect } from "react";
import Tilt from 'react-parallax-tilt';

interface Experience {
  title: string;
  duration: string;
  description: string[];
}

export default function Experience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/experience/experience.json');
      const data = await response.json();
      setExperiences(data);
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col justify-start items-center w-full p-8 bg-gradient-to-br h-[200vh] from-[#211516] to-[#0c1f33]">
      <h1 className="text-3xl font-bold text-cyan-50 mb-8">My Experience</h1>
      <div className="w-full max-w-5xl">
        {experiences.map((experience, index) => (
          <Tilt
            glareEnable={true}
            tiltMaxAngleX={10}
            tiltMaxAngleY={0}
            perspective={500}
            glareColor={"black"}
            key={index}
            className="bg-white p-6 mb-6 shadow-md rounded-md"
          >
            <h2 className="text-xl font-semibold text-gray-800">{experience.title}</h2>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Duration:</strong> {experience.duration}
            </p>
            <p className="text-gray-700">
              {experience.description.map((desc, i) => (
                <span key={i}>
                  - {desc} <br />
                </span>
              ))}
            </p>
          </Tilt>
        ))}
      </div>
    </div>
  );
}
