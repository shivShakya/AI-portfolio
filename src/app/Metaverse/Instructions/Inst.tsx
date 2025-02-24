"use client"
import React from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown, FaMousePointer, FaTimes } from "react-icons/fa";
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { Mic } from "lucide-react";

const Inst: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-md"
    >
      <div className="relative p-6 w-full max-w-lg text-white bg-gray-900 bg-opacity-80 shadow-lg rounded-2xl">
        <button  className="absolute top-3 right-3 text-white text-xl">
          <FaTimes />
        </button>
        <div className="text-red-500 text-2xl font-bold mb-4 text-center">Work In Development</div>
        <div className="text-white text-xl font-bold mb-4 text-center"> It is a simulation home where characters make their own decisions. People can join in real-time, have conversations with them, and influence the built-in character&apos;s daily activities by giving commands.</div>
        <h2 className="text-2xl font-bold mb-4 text-center">Game Controls</h2>
        <div className="space-y-3 text-center">
          <p><span className="font-semibold">Move:</span> <kbd className="bg-gray-700 p-1 rounded">W</kbd> <kbd className="bg-gray-700 p-1 rounded">A</kbd> <kbd className="bg-gray-700 p-1 rounded">S</kbd> <kbd className="bg-gray-700 p-1 rounded">D</kbd> or <FaArrowUp className="inline" /> <FaArrowLeft className="inline" /> <FaArrowDown className="inline" /> <FaArrowRight className="inline" /></p>
          <p><span className="font-semibold">Up / Down:</span> <kbd className="bg-gray-700 p-1 rounded">Q</kbd> / <kbd className="bg-gray-700 p-1 rounded">E</kbd> or <MdKeyboardArrowUp className="inline" /> <MdKeyboardArrowDown className="inline" /></p>
          <p><span className="font-semibold">Look Around:</span> Drag with <FaMousePointer className="inline" /> Mouse</p>
          <p><span className="font-semibold">Voice Mode:</span> for conversation with <Mic className="inline" /> Characters</p>
        </div>
        <p className="text-center text-sm text-gray-400 mt-4">The 3D model is designed by me in Blender. its my home .</p>
      </div>
    </motion.div>
  );
};

export default Inst;
