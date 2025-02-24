"use client";
import { useEffect, useState } from "react";
import Blog from "./blog/page";
import CircularNav from "./CircularNav/CircularNav";
import Education from "./Education/page";
import Experience from "./Experience/page";
import Project from "./Project/page";
import Contact from "./Contact/page";
import Skills from "./Skills/page";
import Resume from "./Resume/page";
import Chatbot from "./Chatbot/Chatbot";
import type { RootState } from '../../redux/store'
import { useSelector , useDispatch } from 'react-redux';
import ProjectDetail from "./Project/ProjectDetail";
import Portfolio from "./Portfolio/page";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import ChatbotPhone from "./Chatbot/ChatbotPhone";
import { setDevice } from "@/redux/deviceSlice";



export default function Home() {
  const [currentPage, setCurrentPage] = useState<string>("");
  const [currentProject , setCurrentProject] = useState<string>("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const category = useSelector((state: RootState) => state.category.value);
  const path = useSelector((state: RootState) => state.path.value);
  const [showMessage, setShowMessage] = useState(false);
  const [presentationMode] = useState(false);
  const dispatch = useDispatch();
  const device = useSelector((state: RootState) => state.device.value);

  useEffect(() => {
    const checkScreenSize = () => {
      if(window.innerWidth < 768){
        dispatch(setDevice("mobile"));
      }else{
        dispatch(setDevice("laptop"));
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  /*
  const scrollToBottomSlow = () => {
    const div = document.getElementById("page");
    if (!div) return;
  
    const targetScroll = div.scrollHeight;
    const duration = 50000; 
    const startTime = performance.now();
    const startScroll = div.scrollTop;
  
    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1); 
      div.scrollTop = startScroll + (targetScroll - startScroll) * progress;
  
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
  
    requestAnimationFrame(animateScroll);
  };
  
  useEffect(() => {
    if (!showOverlay) return;
    setTimeout(scrollToBottomSlow, 100);
  }, [showOverlay]);
  */
  
  

  
  useEffect(() => {
    console.log({ category });
    console.log({ path });
    setShowOverlay(true);

    if (category && path) {
        setCurrentPage("");
    } else if (category) {
        setCurrentPage(category);
    }

    if (path) {
        setCurrentProject(path);
    }
}, [category, path]);
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
      case "portfolio":
        return <Portfolio />
    }
  };

  const renderProjects = () => {
    return <ProjectDetail slug={currentProject} />;
  }

  return (
    <div className="flex flex-col md:flex-row bg-white h-screen">
      <div className="flex flex-1">
       {
        !isHovered &&  <div className="flex w-full md:w-1/4 fixed top-0 z-50 items-center justify-center py-2 bg-customColor border-b border-gray-500">
        <h2 className="text-lg font-bold text-white">Introduction</h2>
      </div>
       }

        <div className="flex justify-center items-center w-full md:w-1/4 bg-white border-4 border-customColor text-white">
          <CircularNav 
              onSelectPage={(page) => {
                  setCurrentPage(page); 
                  setShowOverlay(true); 
              }} 
          />
         {
             device === "mobile" ?  <ChatbotPhone isHovered={isHovered} /> : <Chatbot isHovered={isHovered} /> 
         }
        </div>

        {showMessage && (
        <div className="flex w-full md:w-1/4 z-0 fixed bottom-20 justify-center items-center gap-4 p-4 bg-transparent">
          <div className="w-full md:w-3/4 p-2 border-2 border-gray-600 shadow-xl rounded-xl text-black transition-transform duration-300 ease-in-out">
            Chat with AI to know more about me. Ask relevant questions. 
          </div>
        </div>
      )}
      {
         presentationMode && (
          <div className="flex w-full md:w-1/4 z-0 fixed bottom-20 justify-center items-center gap-4 p-4 bg-transparent">
          <div className="w-full md:w-3/4 p-2 border-2 border-gray-600 shadow-xl rounded-xl text-black transition-transform duration-300 ease-in-out">
               Open Presentation mode to allow AI to present the Shivam&apos;s portfolio . 
          </div>
          </div>
         )
      }
        <div className="flex w-full md:w-1/4 z-40 fixed bottom-0 justify-center gap-3 py-2 bg-customColor border-t text-white border-gray-500">
           <button  className="border-2 border-white rounded-xl px-4 py-2 w-full m-2 flex justify-center items-center gap-4 text-sm font-semibold hover:bg-white hover:text-black transition-colors duration-200"
                onClick={()=>  setIsHovered(!isHovered)} 
                onMouseEnter={() => setShowMessage(true)}
                onMouseLeave={() =>setShowMessage(false)} >
                 Chatbot  {isHovered ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
           </button>
        {/*
        <button  className="border-2 border-white rounded-xl px-4 py-2 w-full m-2 flex justify-center items-center gap-4 text-sm font-semibold hover:bg-white hover:text-black transition-colors duration-200"
          onMouseEnter={() => setPresentationMode(true)}
          onMouseLeave={() =>setPresentationMode(false)} 
        ><FaPlay size={18} /></button>
         */}
        </div>

        {showOverlay && (
          <>
            <div className="absolute z-50 top-2 right-2 cursor-pointer text-white bg-black px-3 py-1 flex items-center justify-center rounded hover:bg-red-600"
            onClick={() => setShowOverlay(false)}
            >
              ✕
              </div>

            <div id="page" className="md:flex flex-1 m-0 scrollbar-hide  md:m-6 border-4 bg-white border-customColor  rounded-lg shadow-lg overflow-y-auto fixed inset-0 z-40 md:static md:z-auto ">
                {renderPageContent()  || renderProjects()}
                {/*   <Tabs /> */}
           </div>

          </>
        )}
      </div>
    </div>
  );
}
