"use client"
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Github, ExternalLink, ChevronLeft, Layout, Smartphone, Globe } from "lucide-react";

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
     // const cleanSlug = slug.split("-").slice(0, -1).join("-");
     const cleanSlug = slug;
      console.log({cleanSlug});
      fetch(`/projects/${cleanSlug}.json`)
        .then((res) => res.json())
        .then((data) => setProjectData(data))
        .catch(err => console.error("Error fetching project:", err));
    }
  }, [slug]);

  if (!projectData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-customBlue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading Project Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* --- Top Navigation --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 pt-16 md:pt-2 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center text-slate-600 hover:text-customBlue transition-all group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="ml-1 font-semibold">Back</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              href={projectData.github_link} 
              target="_blank" 
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-700"
              title="View Source Code"
            >
              <Github size={20} />
            </Link>
            <Link 
              href={projectData.link} 
              target="_blank" 
              className="flex items-center gap-2 px-4 py-2 bg-customBlue text-white rounded-xl hover:opacity-90 transition-opacity font-medium shadow-sm"
            >
              <span>Live Demo</span>
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- Left Content: Video & Details --- */}
          <div className="lg:col-span-7 space-y-10">
            {/* Project Title Header */}
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
                {projectData.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {projectData.description}
              </p>
            </div>

            {/* Video Container Fix */}
            <section className="space-y-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-customBlue to-blue-400 rounded-3xl blur opacity-15"></div>
                
                {/* Fix explanation: 
                   - aspect-[9/16] mobile videos ke liye best hai.
                   - object-contain ensures no zooming.
                   - bg-black provides the pillar-box effect.
                */}
                <div className="relative bg-black rounded-2xl overflow-hidden border border-slate-200 shadow-xl max-h-[700px] flex items-center justify-center">
                  <video
                    src={projectData.videoLink}
                    className="w-full max-h-[700px] object-contain"
                    autoPlay
                    muted
                    loop
                    controls
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Smartphone size={14} />
                <span>Mobile Preview Mode</span>
              </div>
            </section>

            {/* Features Grid */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Layout className="text-customBlue" size={24} /> Key Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectData.features.map((feature, index) => (
                  <div key={index} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-customBlue/30 transition-colors">
                    <p className="text-slate-700 font-medium">
                       <span className="text-customBlue mr-2">✦</span> {feature}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* --- Right Content: Sidebar --- */}
          <aside className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              
              {/* Tech Stack Card */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {projectData.technologies.map((tech, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl border border-slate-100"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Use Cases Card */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Best For</h3>
                <div className="space-y-4">
                  {projectData.useCases.map((useCase, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                        <Globe size={14} className="text-customBlue" />
                      </div>
                      <p className="text-slate-600 text-sm leading-snug">{useCase}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="p-1 bg-gradient-to-br from-customBlue to-blue-600 rounded-[2rem]">
                <div className="bg-white/10 backdrop-blur-sm p-8 rounded-[1.9rem] text-white">
                  <h3 className="text-xl font-bold mb-2">Want to see more?</h3>
                  <p className="text-blue-100 text-sm mb-6">Explore the full documentation on GitHub.</p>
                  <Link 
                    href={projectData.github_link}
                    target="_blank"
                    className="block w-full text-center bg-white text-customBlue font-bold py-3 rounded-2xl hover:bg-blue-50 transition-colors"
                  >
                    Get the Code
                  </Link>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}