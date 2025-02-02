"use client"
import Tilt from 'react-parallax-tilt';

export default function Education() {
  const educationDetails = [
    {
      title: "Formal Education",
      description: [
        "While my formal education details are not included, I have built expertise in 3D development through self-learning, professional roles, and hands-on project work."
      ]
    },
    {
      title: "Self-Learning and Professional Development",
      description: [
        "Learned advanced 3D development tools and frameworks like Three.js, Unity, Unreal Engine, and Babylon.js.",
        "Gained proficiency in Blender for 3D modeling and asset creation.",
        "Strengthened skills in web development using React, Flask, FastAPI, and Django."
      ]
    },
    {
      title: "Certifications and Achievements",
      description: [
        "Completed projects and internships, such as a metaverse 3D editor at Renderpub and campaigns at VRARMR.",
        "Delivered a professional 3D walkthrough as a freelance developer using React-Three-Fiber.",
        "Continuously upgrading knowledge through real-world applications and self-driven projects."
      ]
    }
  ];

  return (
    <div className="flex flex-col justify-start items-center w-full p-8 bg-gradient-to-br h-[100vh] from-[#211516] to-[#0c1f33]">
      <h1 className="text-3xl font-bold text-cyan-50 mb-8">My Education</h1>
      <div className="w-full max-w-5xl">
        {educationDetails.map((education, index) => (
          <Tilt
            glareEnable={true}
            tiltMaxAngleX={10}
            tiltMaxAngleY={0}
            perspective={500}
            glareColor={"black"}
            key={index}
            className="bg-white p-6 mb-6 shadow-md rounded-md"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              {education.title}
            </h2>
            <p className="text-gray-700 mt-4">
              {education.description.map((desc, i) => (
                <span key={i}>
                  - {desc} <br />
                </span>
              ))}
            </p>
          </Tilt>
        ))}
      </div>
    </div>
  );
}
