"use client";
import { useEffect, useState } from "react";
import Blog from "./blog/page";
import CircularNav from "./CircularNav/CircularNav";
import Education from "./Education/page";
import Experience from "./Experience/page";
import Tabs from "./Tabs/Tabs";
import Project from "./Project/page";
import InfoBar from "./InfoBar/InfoBar";
import Contact from "./Contact/page";
import Skills from "./Skills/page";
import Resume from "./Resume/page";
import Chatbot from "./Chatbot/Chatbot";
import type { RootState } from '../../redux/store'
import { useSelector } from 'react-redux'
import Stt from "./Chatbot/Stt/Stt";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<string>("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const category = useSelector((state: RootState) => state.category.value)
  const response = useSelector((state: RootState) => state.response.value);

  useEffect(()=>{
       console.log({category});
       setCurrentPage(category);
       setShowOverlay(true);
  },[category])
  const renderPageContent = () => {
    switch (currentPage) {
      case "blog":
        return <Blog />;
      case "project":
        return <Project />;
      case "experience":
        return <Experience />;
      case "education":
        return <Education />;
      case "contact":
        return <Contact />;
      case "skills":
        return <Skills />;
      case "resume":
        return <Resume />;
      default:
        return <div className="text-white"></div>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-white h-screen">
      <div className="flex flex-1">
        <div className="flex w-full md:w-1/4 fixed top-0 z-50 items-center justify-center py-2 bg-customColor border-b border-gray-500">
          <h2 className="text-lg font-bold text-white">Introduction</h2>
        </div>

        <div className="flex justify-center items-center w-full md:w-1/4 bg-white border-4 border-customColor text-white">
          <InfoBar />
          <CircularNav 
              onSelectPage={(page) => {
                  setCurrentPage(page); 
                  setShowOverlay(true); 
              }} 
          />
          <Chatbot isHovered={isHovered}/>
        </div>

        <div className="flex w-full md:w-1/4 z-50 fixed bottom-0 justify-center gap-3 py-2 bg-customColor border-t text-white border-gray-500">
        <button  onClick={()=>setIsHovered(!isHovered)} > Chatbot </button>
          <Stt/>
        </div>

        {showOverlay && (
          <>
            <div className="absolute z-50 top-2 right-2 cursor-pointer text-white bg-black px-3 py-1 flex items-center justify-center rounded hover:bg-red-600"
            onClick={() => setShowOverlay(false)}
            >
              ✕
              </div>

            <div className="md:flex flex-1 m-0  md:m-6 border-4 bg-white border-customColor  rounded-lg shadow-lg overflow-y-auto fixed inset-0 z-40 md:static md:z-auto ">
                {renderPageContent()}
                  <Tabs />
           </div>

          </>
        )}
      </div>
    </div>
  );
}
