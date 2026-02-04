"use client";
import { useState, useEffect } from "react";
import Tilt from "react-parallax-tilt";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface Experience {
  title: string;
  duration: string;
  description: string[];
}

export default function Experience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [expandedIndexes, setExpandedIndexes] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/experience/experience.json");
      const data = await response.json();
      setExperiences(data);
    };

    fetchData();
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="flex flex-col justify-start items-center w-full p-8 mt-6 mb-6 md:mt-0 md:mb-0 bg-white">
      <h1 className="text-3xl font-bold text-customDark mb-8">My Experience</h1>
      <div className="w-full max-w-5xl">
        {experiences.map((experience, index) => (
          <Tilt
            glareEnable={false}
            tiltMaxAngleX={0}
            tiltMaxAngleY={0}
            key={index}
            className="bg-white border border-gray-500 p-6 mb-6 shadow-md rounded-md"
          >
            <div className="flex justify-between items-center" onClick={() => toggleExpand(index)}>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{experience.title}</h2>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Duration:</strong> {experience.duration}
                </p>
              </div>
              <button
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                {expandedIndexes[index] ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
              </button>
            </div>

            {expandedIndexes[index] && (
              <div className="text-gray-700 mt-4">
                {experience.description.map((desc, i) => (
                  <p key={i} className="mb-2">
                    - {desc}
                  </p>
                ))}
              </div>
            )}
          </Tilt>
        ))}
      </div>
    </div>
  );
}
