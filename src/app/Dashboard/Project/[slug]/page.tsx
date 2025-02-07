"use client"
import { useEffect, useState } from 'react';
import { usePathname } from "next/navigation";

interface ProjectData {
  title: string;
  description: string;
  features: string[];
  technologies: string[];
  useCases: string[];
  videoLink: string;
}

export default function ProjectDetail() {
  const pathname = usePathname();
  const slug = pathname.split("/").pop();
  console.log({ slug });
  const [projectData, setProjectData] = useState<ProjectData | null>(null);

  useEffect(() => {
    if (slug) {
      fetch(`/projects/${slug}.json`)
        .then((res) => res.json())
        .then((data) => setProjectData(data));
    }
  }, [slug]);

  if (!projectData) {
    return <p className="text-center text-customTextCoor mt-8">Loading...</p>;
  }

  return (
    <div className="p-8 bg-customLight min-h-screen flex flex-col items-center">
      <div className="w-full max-w-3xl rounded-lg overflow-hidden shadow-lg mb-8">
        <video
          src={projectData.videoLink}
          controls
          className="w-full h-96 object-cover rounded-md"
        ></video>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-customBlue mb-4">{projectData.title}</h1>
        <p className="text-customTextCoor text-lg mb-6 px-4">{projectData.description}</p>
      </div>

      <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-customBlue mb-4">Features</h2>
        <ul className="list-disc pl-6 text-customTextCoor">
          {projectData.features.map((feature, index) => (
            <li key={index} className="text-lg">{feature}</li>
          ))}
        </ul>
      </div>

      <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-customBlue mb-4">Technologies Used</h2>
        <ul className="list-disc pl-6 text-customTextCoor">
          {projectData.technologies.map((tech, index) => (
            <li key={index} className="text-lg">{tech}</li>
          ))}
        </ul>
      </div>

      <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-customBlue mb-4">Use Cases</h2>
        <ul className="list-disc pl-6 text-customTextCoor">
          {projectData.useCases.map((useCase, index) => (
            <li key={index} className="text-lg">{useCase}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
