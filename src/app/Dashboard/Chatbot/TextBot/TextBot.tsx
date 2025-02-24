"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCategory } from "@/redux/categorySlice";
import { setTextResponse } from "@/redux/responseSlice";
import { Loader2 } from "lucide-react";
import type { RootState } from "@/redux/store";
import { setPath } from "@/redux/pathSlice";


function TextBot() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [voiceOutput , setVoiceOutput] = useState("");
  const [sessionId] = useState<string>(() =>
    typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
  );
  
  const dispatch = useDispatch();
  const textResponse = useSelector((state: RootState) => state.response.value);
  const inputText = useSelector((state: RootState) => state.input.value);
  const outputText = useSelector((state: RootState) => state.output.value);
  const device = useSelector((state: RootState) => state.device.value);

 
 useEffect(()=>{
      dispatch(setTextResponse(""));
      setVoiceOutput((prevText) =>prevText+" "+ outputText );
 },[outputText]);

 useEffect(()=>{
  dispatch(setTextResponse(""));
  setVoiceOutput("User:" + " "+inputText + "\n" + "AI:");
},[inputText])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input, sessionId }),
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const data = await res.json();
      console.log({data});
      const response = JSON.parse(data.response);
      if (response && response.link) {
        console.log({ link: response.link });
        dispatch(setCategory(response.link));
      }

      if (response?.path) {
        console.log({ path: response.path });
        dispatch(setPath(response.path.length > 0 ? response.path[0] : ""));
      } else {
        dispatch(setPath(""));
      }
    


      dispatch(setTextResponse(response.response));
      setInput("");
    } catch (err) {
      setError("Failed to get response. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-1">
      {
          device !== 'mobile' ?  <div className="border border-customColor rounded-lg w-full h-48 max-h-64 mb-6  overflow-y-auto bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-customColor w-8 h-8" />
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <p className="text-customBlue font-extrabold p-3 whitespace-pre-wrap break-words w-full overflow-hidden">
              {textResponse || voiceOutput}
            </p>
          )}
        </div> : <div className="border border-customColor rounded-lg w-full h-48 max-h-20 mb-1  overflow-y-auto bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-customColor w-8 h-8" />
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <p className="text-customBlue font-extrabold p-3 whitespace-pre-wrap break-words w-full overflow-hidden">
              {textResponse || voiceOutput}
            </p>
          )}
        </div> 
      }
     
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 p-3 border rounded-lg border-customBlue scrollbar-hide text-customTextCoor focus:outline-none focus:ring-2 focus:ring-customColor"
          disabled={isLoading}
        />
         <button
          type="submit"
          className="relative flex items-center justify-center  py-1 m-2 text-center  border-4 border-customColor text-black hover:text-white font-semibold rounded-3xl shadow-md hover:bg-customColor focus:outline-none focus:ring-2 focus:ring-blue-300"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? "Generate" : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default TextBot;
