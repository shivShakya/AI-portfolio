"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
//import Link from 'next/link';
import Tilt from 'react-parallax-tilt';
import { setPath } from "@/redux/pathSlice";
import { useDispatch } from "react-redux";


interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
}

export default function Project() {
  const [projects, setProjects] = useState<Project[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    fetch('/projects/projects.json')
      .then((response) => response.json())
      .then((data) => setProjects(data))
      .catch((error) => console.error("Error loading projects:", error));
  }, []);

  return (
    <div className="flex flex-col justify-start items-center bg-gradient-to-br from-[#211516] to-[#0c1f33] bg-inherit w-full p-1 h-[200vh]">
      <h1 className="text-3xl font-bold text-cyan-50 mb-8">My Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {projects.map((project) => (
          <Tilt
            glareEnable={true}
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            perspective={500}
            glareColor={"black"}
            key={project.id}
            className="p-4 rounded-2xl shadow-lg bg-white text-customDark flex flex-col hover:scale-[1.02] transition-transform duration-200"
          >
            <Image
              src={project.image}
              alt={project.title}
              width={280} 
              height={280} 
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h3 className="text-xl font-semibold">{project.title}</h3>
            <p className="text-customTextCoor text-sm mt-2">
              {project.description}
            </p>
            <button
              onClick={() => dispatch(setPath(`${project.id}-${Date.now()}`))}
              className="mt-auto w-max px-4 py-2 bg-customLight text-[#211516] font-medium rounded-lg hover:bg-[#0c1f33] hover:text-customLight transition-all"
            >
              View More
            </button>
          </Tilt>
        ))}
      </div>
    </div>
  );
}
