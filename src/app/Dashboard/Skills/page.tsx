"use client"
import { useEffect, useState } from 'react';
import Tilt from 'react-parallax-tilt';

interface SkillCategory {
  title: string;
  skills: string[];
}

export default function Skills() {
  const [skillsData, setSkillsData] = useState<SkillCategory[]>([]);

  useEffect(() => {
    fetch('/Skills/skills.json')
      .then((response) => response.json())
      .then((data: SkillCategory[]) => setSkillsData(data))
      .catch((error) => console.error('Error fetching skills data:', error));
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-full p-8 bg-gradient-to-br from-[#211516] to-[#0c1f33]">
      <h1 className="text-3xl font-bold text-cyan-50 mb-8">My Skills</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 w-full max-w-6xl">
        {skillsData.map((category, index) => (
          <Tilt
            glareEnable={true}
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            perspective={500}
            glareColor={"black"}
            key={index}
            className="p-6 rounded-2xl shadow-lg bg-white text-gray-800 flex flex-col hover:scale-[1.02] transition-transform duration-200"
          >
            <h2 className="text-xl font-semibold mb-4">{category.title}</h2>
            <ul className="list-disc list-inside text-gray-700">
              {category.skills.map((skill, skillIndex) => (
                <li key={skillIndex}>{skill}</li>
              ))}
            </ul>
          </Tilt>
        ))}
      </div>
    </div>
  );
}
