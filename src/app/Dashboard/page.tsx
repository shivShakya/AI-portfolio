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
import { endChat, preloadChatAssets } from "./Chatbot/chatClient";
import PageTransition, { type Origin } from "./PageTransition";
import type { RootState } from '../../redux/store'
import { useSelector , useDispatch } from 'react-redux';
import ProjectDetail from "./Project/ProjectDetail";
import Portfolio from "./Portfolio/page";
import { setDevice } from "@/redux/deviceSlice";
import { setChatOpen } from "@/redux/chatSlice";
import { MessageCircle, MoveLeft, X } from "lucide-react";
import Link from "next/link";



export default function Home() {
  const [currentPage, setCurrentPage] = useState<string>("");
  const [currentProject , setCurrentProject] = useState<string>("");
  const [showOverlay, setShowOverlay] = useState(false);
  // Drives the section entrance animation: where it grows from, and a tick to replay it.
  const [navOrigin, setNavOrigin] = useState<Origin>(null);
  const [navTick, setNavTick] = useState(0);
  // Chat open state lives in the shared store, so a chat started on the home page stays open here.
  const isHovered = useSelector((state: RootState) => state.chat.open);
  const chatExpanded = useSelector((state: RootState) => state.chat.expanded);
  const isMobile = useSelector((state: RootState) => state.device.value) === "mobile";
  // Phones/tablets: the chat is a bottom sheet, so the page above it stays usable.
  const chatSheet = isHovered && isMobile && !chatExpanded;
  const chatCovers = isHovered && !chatSheet;
  // Opening shows the chat; closing ends the conversation (next open starts fresh).
  const setIsHovered = (open: boolean) => (open ? dispatch(setChatOpen(true)) : endChat());
  const category = useSelector((state: RootState) => state.category.value);
  const path = useSelector((state: RootState) => state.path.value);
  const [showMessage, setShowMessage] = useState(false);
  const [presentationMode] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => preloadChatAssets(), []);

  useEffect(() => {
    const checkScreenSize = () => {
      if(window.innerWidth < 1024){
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
    setNavOrigin(null); // opened by the chatbot, not a nav tap: reveal from the left edge

    if (category && path) {
        setCurrentPage("");
    } else if (category) {
        setCurrentPage(category);
    }

    if (path) {
      //  path = path + "-" + Date.now();
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
    <div className="flex flex-col lg:flex-row bg-white h-screen">
      <div className="flex flex-1">
       {
        !chatCovers &&  <div className="flex w-full lg:w-1/4 fixed top-0 z-50 items-center justify-center py-2 bg-surface border-b border-gray-300">
        <h2 className="text-lg font-bold text-ink flex justify-center item-center gap-2"> <Link href="/"> <MoveLeft className="text-ink cursor-pointer" /></Link> Introduction</h2>
      </div>
       }

        <div className="flex justify-center items-center w-full lg:w-1/4 bg-white border-4 border-customColor text-white">
          <CircularNav 
              activePage={currentPage || (currentProject ? "project" : "portfolio")}
              onSelectPage={(page, origin) => {
                  setNavOrigin(origin ?? null);
                  setNavTick((t) => t + 1);
                  setCurrentPage(page); 
                  setShowOverlay(true); 
              }} 
          />
         {
             <Chatbot isHovered={isHovered} /> 
         }
        </div>

        {showMessage && (
        <div className="flex w-full lg:w-1/4 z-0 fixed bottom-20 justify-center items-center gap-4 p-4 bg-transparent">
          <div className="hidden lg:block w-full lg:w-3/4 px-3 py-2 bg-surface border border-gray-200 shadow-lg rounded-xl text-sm text-gray-700">
            Chat with my AI to know more about me. Ask anything!
          </div>
        </div>
      )}
      {
         presentationMode && (
          <div className="flex w-full lg:w-1/4 z-0 fixed bottom-20 justify-center items-center gap-4 p-4 bg-transparent">
          <div className="w-full lg:w-3/4 p-2 border-2 border-gray-600 shadow-xl rounded-xl text-black transition-transform duration-300 ease-in-out">
               Open Presentation mode to allow AI to present the Shivam&apos;s portfolio . 
          </div>
          </div>
         )
      }
        <div className="flex w-full lg:w-1/4 z-40 fixed bottom-0 justify-center gap-3 py-2 bg-surface border-t text-ink border-gray-300">
           <button  className={`rounded-xl px-4 py-2.5 w-full m-2 flex justify-center items-center gap-2 text-sm font-semibold transition-colors duration-200 ${isHovered ? "border border-gray-300 hover:bg-gray-100" : "bg-accent text-white hover:opacity-90"}`}
                aria-expanded={isHovered}
                onClick={()=>  setIsHovered(!isHovered)} 
                onMouseEnter={() => setShowMessage(true)}
                onMouseLeave={() =>setShowMessage(false)} >
                 {isHovered ? (<><X size={16} /> Close chat</>) : (<><MessageCircle size={16} /> Chat with my AI</>)}
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
            <div className={`absolute lg:hidden z-50 top-1.5 right-12 cursor-pointer ${chatCovers ? "hidden" : "visible"} text-white bg-black px-3 py-1 flex items-center justify-center rounded hover:bg-red-600`}
            onClick={() => setShowOverlay(false)}
            >
              ✕
              </div>

            <div id="page" className={`lg:flex flex-1 m-0 scrollbar-hide lg:m-6 border-0 lg:border-4 bg-white border-customColor rounded-none lg:rounded-lg shadow-lg overflow-y-auto fixed inset-x-0 top-11 ${chatSheet ? "bottom-[calc(68px_+_max(25vh,230px))]" : "bottom-[68px]"} z-30 lg:static lg:z-auto `}>
                <PageTransition
                  transitionKey={`${currentPage}|${currentProject}|${navTick}`}
                  origin={navOrigin}
                >
                  {renderPageContent()  || renderProjects()}
                </PageTransition>
                {/*   <Tabs /> */}
           </div>

          </>
        )}
      </div>
    </div>
  );
}
