"use client"
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Link as LinkIcon, Icon } from "lucide-react";
import { burger } from '@lucide/lab';


interface ProjectData {
  title: string;
  link: string;
  github_link: string;
  description: string;
  features: string[];
  technologies: string[];
  useCases: string[];
  videoLink: string;
}

export default function ProjectDetail({ slug }: { slug: string }) {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);

  useEffect(() => {
    if (slug) {
      console.log({slug});
      const cleanSlug = slug.split("-").slice(0, -1).join("-");
      console.log({cleanSlug});
      fetch(`/projects/${cleanSlug}.json`)
        .then((res) => res.json())
        .then((data) => setProjectData(data));
    }
  }, [slug]);

  if (!projectData) {
    return <p className="text-center text-customTextCoor mt-8">Loading...</p>;
  }

  return (
    <div className="p-8 mt-10 bg-customLight min-h-screen  flex flex-col items-left">
    

      <div className="text-center mb-12">
       <div className='flex justify-center items-center'>
       <h1 className="text-4xl font-bold text-customBlue mb-4">{projectData.title}</h1>
          <Link className="text-xl font-bold text-customDark m-2" href={projectData.link}  target="_blank" rel="noopener noreferrer"><LinkIcon className='text-customBlue' /></Link>
          <Link className="text-xl font-bold text-customDark m-2" href={projectData.github_link}><Icon iconNode={burger} className='text-customBlue' /></Link>
       </div>
        <video
             src={projectData.videoLink}
             className="w-full h-96 object-cover rounded-lg pointer-events-none"
             disablePictureInPicture
             autoPlay
             muted
             loop
             controlsList="nodownload nofullscreen noremoteplayback"
        ></video>
        <p className="text-customTextCoor text-left text-lg mt-6 px-4">{projectData.description}</p>
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
