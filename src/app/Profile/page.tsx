import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faTwitter } from "@fortawesome/free-brands-svg-icons";
import Image from 'next/image';


export function Profile() {
  return (
    <div className="flex flex-col md:flex-row items-center w-full">
  <Image
  src="/shivam.jpeg"
  alt="Description of the image"
  width={150} 
  height={150} 
  className="w-1/2  md:w-1/4  aspect-square bg-gray-300 rounded-full m-8 hover:scale-110 transition-transform duration-500 shadow-lg shadow-gray-800"
/>

      <div className="text-center md:text-start">
        <h2 className="text-2xl font-bold mb-2">
          Shivam Shakya
          <div className="flex justify-center md:justify-start space-x-4 mt-2">
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
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Full Stack Developer
        </h3>
        <p className="text-gray-600 text-center md:text-start">
          Hi, I am a web and mobile app developer, metaverse and machine
          learning enthusiast. I love coding, theatre, and traveling. Here is
          my portfolio to showcase my skills.
        </p>
      </div>
    </div>
  );
}

