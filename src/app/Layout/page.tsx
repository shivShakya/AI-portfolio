"use client"
import React, { useEffect } from "react";
import { gsap } from "gsap";
import Tilt from 'react-parallax-tilt';


export function Layout() {
  useEffect(() => {
    gsap.fromTo(
      ".card",
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out",
      }
    );
  }, []);

  return (
    <div className="p-6 font-sans w-full bg-gray-100 text-gray-900">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {[
          { title: "Programming", items: ["HTML/CSS", "Python", "JavaScript", "Java"] },
          { title: "Skills", items: ["Problem Solving", "Teamwork", "Communication"] },
          { title: "Work Experience", items: ["Software Engineer at Company X", "Frontend Developer at Company Y"] },
          { title: "Education", items: ["Bachelor's in Computer Science", "Master's in Software Engineering"] },
        ].map((section, index) => (
          <Tilt  glareEnable={true}  tiltMaxAngleX={10} 
          tiltMaxAngleY={10} perspective={500}  key={index} 
          className="card flex flex-col justify-start items-center min-h-[25vh] p-6 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-customColor hover:text-white transition-shadow">
                <div>
            <div className="text-2xl font-semibold mb-4">{section.title}</div>
            <div className="w-full p-4">
              <ul className="space-y-2 text-gray-700 text-lg">
                {section.items.map((item, idx) => (
                  <li key={idx} className="font-medium hover:text-white">{item}</li>
                ))}
              </ul>
            </div>
          </div>

          </Tilt>
        ))}
      </div>
    </div>
  );
}
