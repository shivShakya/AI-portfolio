"use client";
import { useState, useEffect } from "react";
import Tilt from "react-parallax-tilt";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface EducationPost {
  title: string;
  description: string[];
}

export default function Education() {
  const [blocks, setBlocks] = useState<EducationPost[]>([]);
  const [expandedIndexes, setExpandedIndexes] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchEducationData = async () => {
      const response = await fetch("/education/education.json");
      const data = await response.json();
      setBlocks(data);
    };

    fetchEducationData();
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="flex flex-col justify-start items-center w-full mt-6 mb-6 md:mt-0 md:mb-0 p-8 bg-white h-full">
      <h1 className="text-3xl font-bold text-customDark mb-8">My Education</h1>
      <div className="w-full max-w-5xl">
        {blocks.map((education, index) => (
          <Tilt
            glareEnable={false}
            tiltMaxAngleX={2}
            tiltMaxAngleY={0}
            perspective={500}
            glareColor={"black"}
            key={index}
            className="bg-white border border-gray-500 p-6 mb-6 shadow-md rounded-md"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">{education.title}</h2>
              <button
                onClick={() => toggleExpand(index)}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                {expandedIndexes[index] ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
              </button>
            </div>

            {expandedIndexes[index] && (
              <div className="text-gray-700 mt-4">
                {education.description.map((desc, i) => (
                  <p key={i} className="mb-2">- {desc}</p>
                ))}
              </div>
            )}
          </Tilt>
        ))}
      </div>
    </div>
  );
}
