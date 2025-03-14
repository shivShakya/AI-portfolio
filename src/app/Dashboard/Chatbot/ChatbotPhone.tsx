"use client"
import React from "react";
import TextBot from "./TextBot/TextBot";
import VoiceBot from "./VoiceBot/VoiceBot";
import Stt from "./Stt/Stt";



interface ChatbotProps {
    isHovered : boolean;
}

export default function ChatbotPhone({isHovered} : ChatbotProps) {
  return (
    <div
      className={`fixed bottom-0 z-30 left-0 w-full md:w-1/4 bg-background border border-gray-500 rounded-t-md overflow-hidden transition-all duration-500 ease-in-out ${
        isHovered ? "h-80" : "h-16"
      }` }
    >
      {isHovered && (
        <div
          className="p-6 text-white bg-customColor overflow-y-auto flex flex-col-reverse"
          style={{ scrollBehavior: "smooth", maxHeight: "calc(100vh - 64px)" }}
        >
          <div className="h-screen w-full">
          <div className="h-full w-full flex justify-start items-center flex-col bg-white border border-black rounded-[2%]">
             <div className="flex  justify-center items-center flex-col"> 
                  <div className="fixed z-50 -mt-72">
                  <VoiceBot modelUrl="./me.glb" />
                  </div>    
                  
                    <Stt></Stt>
                    <TextBot />
              </div>
          </div>
          </div>
        </div>
      )}

      <div className="flex justify-center py-2 bg-transparent border-t border-black">
      </div>
    </div>
  );
}
