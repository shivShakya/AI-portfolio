"use client";
import Layout from "./Dashboard/Layout/Layout";
import Profile from "./Dashboard/Profile/Profile";
import Link from "next/link";


const Test: React.FC = () => {
  return (
    <div className="p-6 font-sans">
      <div className="flex justify-center md:justify-end items-center mb-4">
       {/*
        <Link
          href="/Metaverse"
          className="relative flex items-center px-9 py-2 border-4 border-customColor hover:text-white font-semibold rounded-3xl shadow-md hover:bg-customColor focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Enter the Metaverse
        </Link>

        */}
      </div>

      <div className="flex flex-col justify-center items-center">
        <div className="w-full md:w-2/3 h-full">
          <Profile />
        </div>

        <Layout />

        <div className="mt-4 bottom-5  md:absolute">
          <Link
            href="/Dashboard"
            className="relative flex items-center px-9 py-2 border-4 border-customColor hover:text-white font-semibold rounded-3xl shadow-md hover:bg-customColor focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <span className="mr-2">Explore</span>
            <span className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 animate-move-right"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes move-right {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(6px);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-move-right {
          animation: move-right 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Test;
