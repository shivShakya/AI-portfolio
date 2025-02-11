"use client";

import React, { useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { setCategory } from "@/redux/categorySlice";
import { useDispatch } from "react-redux";
//import { setTextResponse } from "@/redux/responseSlice";
import { setVoiceContent } from "@/redux/voiceContent";
import { setInput } from "@/redux/inputTextSlice";

interface SttProps {
  children?: React.ReactNode;
}

const Stt: React.FC<SttProps> = ({ children }) => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<string>("");
  const [sessionId] = useState<string>(() => crypto.randomUUID());
  const [isListening, setIsListening] = useState<boolean>(false);
  const dispatch = useDispatch();
  let finalTranscript = "";

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
         // dispatch(setTextResponse(apiResponseData.response));
        } else {
          setApiResponse(`Failed to fetch API: ${response.statusText}`);
        }
      } catch (error: any) {
        setApiResponse(`Error: ${error.message}`);
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
    } catch (error: any) {
      console.error("Failed to fetch voice bot data:", error.message);
    }
  };

  return (
    <div onClick={toggleListening}>
      {children}
    </div>
  );
};

export default Stt;