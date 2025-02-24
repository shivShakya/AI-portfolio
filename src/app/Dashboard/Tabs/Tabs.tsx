"use client"

import Presentation from "./Presentation/Presentation";

export default function Tabs() {
  return (
    <div className="fixed bottom-0 hidden md:flex justify-center items-center gap-2 bg-[#013954] rounded-lg p-2 m-2 shadow-lg w-full md:w-auto">
      <div className="flex items-center justify-center">
        <div className="bg-[#F1F1F1] rounded-full px-2 py-1 text-center text-black font-medium text-sm shadow-sm hover:bg-gray-300 cursor-pointer">
          Likes
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="bg-[#F1F1F1] rounded-full px-2 py-1 text-center text-black font-medium text-sm shadow-sm hover:bg-gray-300 cursor-pointer">
          Comments
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="bg-[#F1F1F1] rounded-full px-2 py-1 text-center text-black font-medium text-sm shadow-sm hover:bg-gray-300 cursor-pointer">
          Summarizer
        </div>
      </div>
      <div className="flex items-center justify-center">
         <Presentation/>
      </div>
    </div>
  );
}
