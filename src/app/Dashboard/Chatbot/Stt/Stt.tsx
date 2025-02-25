"use client";

import React, { useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { setCategory } from "@/redux/categorySlice";
import { useDispatch } from "react-redux";
//import { setTextResponse } from "@/redux/responseSlice";
import { setVoiceContent } from "@/redux/voiceContent";
import { setInput } from "@/redux/inputTextSlice";
import { setPath } from "@/redux/pathSlice";
import { Mic, MicOff } from "lucide-react";


interface SttProps {
  children?: React.ReactNode;
}

const Stt: React.FC<SttProps> = ({ children }) => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<string>("");
  const [sessionId] = useState<string>(() =>
    typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
  );
  
  const [isListening, setIsListening] = useState<boolean>(false);
  const dispatch = useDispatch();
  let finalTranscript = "";
  console.log({apiResponse});
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();

  if (!isClient) return null;

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser does not support speech recognition.</span>;
  }

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      startListening();
    } else {
      setIsListening(false);
      SpeechRecognition.stopListening();
    }
  };

  const startListening = () => {
    finalTranscript = "";
    SpeechRecognition.startListening({ continuous: false });

    const recognitionInstance = SpeechRecognition.getRecognition();
    if (recognitionInstance) {
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        finalTranscript = transcript;
        dispatch(setInput(transcript));
        console.log("Final Transcript:", finalTranscript);
      };

      recognitionInstance.onend = handleSpeechEnd;
    }
  };

  const handleSpeechEnd = async () => {
    console.log("Speech recognition stopped.");
    console.log({ finalTranscript });
    if (finalTranscript) {
      await sendRequest(finalTranscript);
    }
  };

  const sendRequest = async (transcript: string) => {
    console.log({ transcript });
    if (transcript) {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: transcript, sessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          const apiResponseData = JSON.parse(data.response);
          console.log({ apiResponseData: apiResponseData.response });

          if (apiResponseData.response) {
            fetchVoiceBotData(apiResponseData.response);
          }

          if (apiResponseData && apiResponseData.link) {
            dispatch(setCategory(apiResponseData.link));
          }

          if (apiResponseData?.path) {
            console.log({ path: apiResponseData.path });
            dispatch(setPath(apiResponseData.path.length > 0 ? apiResponseData.path[0] : ""));
      } else {
            dispatch(setPath(""));
      }

      setIsListening(false);
         // dispatch(setTextResponse(apiResponseData.response));
        } else {
          setApiResponse(`Failed to fetch API: ${response.statusText}`);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setApiResponse(`Error: ${error.message}`);
        } else {
          setApiResponse('An unknown error occurred.');
        }
      } finally {
        resetTranscript();
      }
    }
  };

  const fetchVoiceBotData = async (text?: string) => {
    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Error fetching API: ${response.statusText}`);
      }

      const data = await response.json();
      dispatch(setVoiceContent(data));
    } catch (error: unknown) {
      if (error instanceof Error) {
        setApiResponse(`Error: ${error.message}`);
      } else {
        setApiResponse('An unknown error occurred.');
      }
    }
  };

  return (
    <div onClick={toggleListening} className="w-full flex justify-end items-end">
       {
         isListening ?
           <Mic className="hover:cursor-pointer text-black"></Mic> :
           <MicOff className="hover:cursor-pointer text-black"></MicOff>
       }
      {children}
    </div>
  );
};

export default Stt;