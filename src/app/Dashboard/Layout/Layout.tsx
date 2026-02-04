"use client"
import React, { useEffect } from "react";
import { gsap } from "gsap";
//import Tilt from "react-parallax-tilt";

const Layout = () => {
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
    <div className="p-6 font-sans w-full  md:absolute bottom-20 bg-gray-100 text-gray-900">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {[
          { title: "Programming", items: ["Java", "Javascript", "Python", "c++"] },
          { title: "Skills", items: ["Full Stack Development", "3d Development", "Machine learning","AWS"] },
          { title: "Work Experience", items: ["3D Developer at VRARMR, Delhi", "Full Stack Intern at Renderpub, Bengluru"] },
          { title: "Education", items: ["PG Diploma DAC,Cdac Acts Pune","Master's from Pune Unveristiy", "Bechlor's from Delhi University"] },
        ].map((section, index) => (
          <div
            key={index}
            className="card flex flex-col justify-start items-center min-h-[25vh] p-6 bg-white border border-gray-300 rounded-lg shadow-lg  transition-shadow"
          >
            <div>
              <div className="text-2xl font-semibold mb-4">{section.title}</div>
              <div className="w-full p-4">
                <ol className=" text-gray-700 text-lg">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="font-medium ">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Layout;
