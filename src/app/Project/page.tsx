"use client"
import Image from 'next/image';
import Link from 'next/link';
import Tilt from 'react-parallax-tilt';


export default function Project() {
  const projects = [
    { id: 1, title: "Face Recognition System", description: "A robust system for facial detection and recognition.", image: "/images/face-recognition.jpg" },
    { id: 2, title: "CraftStore", description: "An e-commerce platform for creative craft products.", image: "/images/craftstore.jpg" },
    { id: 3, title: "Fine-tuning Stable Diffusion Model", description: "A custom-trained diffusion model for image generation.", image: "/images/stable-diffusion.jpg" },
    { id: 4, title: "AI Swiper Simulator", description: "An AI-powered simulator for user interaction.", image: "/images/ai-swiper.jpg" },
    { id: 5, title: "3D Chatbot", description: "An interactive chatbot powered by 3D elements.", image: "/images/3d-chatbot.jpg" },
    { id: 6, title: "FaceSwap", description: "AI-based face-swapping application for fun and creativity.", image: "/images/faceswap.jpg" },
    { id: 7, title: "AR Projects", description: "Augmented reality experiences for immersive engagement.", image: "/images/ar-projects.jpg" },
    { id: 8, title: "Graph Generator", description: "Use AI to analyse your data.", image: "/images/ar-projects.jpg" },
    { id: 9, title: "Image captioning generator", description: "Image captioning.", image: "/images/ar-projects.jpg" },
  ];

  return (
    <div className="flex flex-col justify-start items-center bg-gradient-to-br from-[#211516] to-[#0c1f33] bg-inherit  w-full p-1 h-[200vh]">
      <h1 className="text-3xl font-bold text-cyan-50 mb-8">Our Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {projects.map((project) => (

          <Tilt
          glareEnable={true}  tiltMaxAngleX={10} 
          tiltMaxAngleY={10} perspective={500}
          glareColor={"black"}
            key={project.id}
            className="p-4 rounded-2xl shadow-lg bg-white text-customDark flex flex-col hover:scale-[1.02] transition-transform duration-200"
          >
            <Image
              src={project.image}
              alt={project.title}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h3 className="text-xl font-semibold">{project.title}</h3>
            <p className="text-customTextCoor text-sm mt-2">
              {project.description}
            </p>
            <Link
              href={`/Project/${project.id}`}
              className="mt-auto w-max px-4 py-2 bg-customLight text-[#211516] font-medium rounded-lg hover:bg-[#0c1f33] hover:text-customLight transition-all" >
              View More
            </Link>
          </Tilt>
        ))}
      </div>
    </div>
  );
}
