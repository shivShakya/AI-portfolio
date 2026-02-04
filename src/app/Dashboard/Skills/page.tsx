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
    fetch('/skills/skills.json')
      .then((response) => response.json())
      .then((data: SkillCategory[]) => setSkillsData(data))
      .catch((error) => console.error('Error fetching skills data:', error));
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto pt-14 bg-white transition-all duration-500">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center tracking-tight">
        Technical Expertise
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillsData.map((category, index) => (
          <Tilt
            key={index}
            glareEnable={true}
            glareMaxOpacity={0.1}
            tiltMaxAngleX={5}
            tiltMaxAngleY={5}
            perspective={1000}
            className="group p-8 border border-gray-100 rounded-3xl shadow-sm bg-stone-50/50 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider">
              {category.title}
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill, skillIndex) => (
                <span 
                  key={skillIndex}
                  className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-full group-hover:border-blue-400 group-hover:text-blue-600 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Tilt>
        ))}
      </div>
    </div>
  );
}