"use client"
import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faTwitter } from "@fortawesome/free-brands-svg-icons";
import Image from 'next/image';


export default function Profile() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".profile-photo", {
        autoAlpha: 0,
        scale: 0.85,
        filter: "blur(10px)",
        duration: 1.2,
        clearProps: "transform,filter", // keep the CSS hover zoom working
      }).from(
        ".profile-reveal",
        { autoAlpha: 0, y: 18, duration: 0.9, stagger: 0.1 },
        0.25
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="flex flex-col md:flex-row items-center w-full">
  <Image
  src="/shivam.jpeg"
  alt="Shivam Shakya"
  width={150} 
  height={150} 
  className="profile-photo w-1/2  md:w-1/4  aspect-square bg-gray-300 rounded-full m-8 hover:scale-110 transition-transform duration-500 shadow-lg shadow-gray-800"
/>

      <div className="text-center md:text-start">
        <h2 className="text-2xl font-bold mb-2">
          <span className="profile-reveal inline-block">Shivam Shakya</span>
          <div className="profile-reveal flex justify-center md:justify-start space-x-4 mt-2">
            <a
              href="https://www.linkedin.com/in/shivam-shakya13/"
              className=" hover:text-blue-800"
            >
              <FontAwesomeIcon icon={faLinkedin} size="sm" />
            </a>
            <a
              href="https://twitter.com/ShivamS76398678"
              className="text-black hover:text-blue-600"
            >
              <FontAwesomeIcon icon={faTwitter} size="sm" />
            </a>
          </div>
        </h2>
        <h3 className="profile-reveal text-lg font-semibold text-gray-700 mb-4">
          Software Engineer
        </h3>
        <p className="profile-reveal text-gray-600 text-center md:text-start">
          Hi, I am a software engineer with 3 years of experience, and a
          metaverse and machine learning enthusiast. I love coding, theatre,
          and traveling. Here is my portfolio to showcase my skills.
        </p>
      </div>
    </div>
  );
}

