'use client';

import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { setCategory } from "@/redux/categorySlice";
import { useDispatch } from 'react-redux';
import { setTextResponse } from "@/redux/responseSlice";
import { Mic, MicOff } from 'lucide-react';

const Stt = () => {
  const [isClient, setIsClient] = useState(false);
  const [apiResponse, setApiResponse] = useState('');
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isListening, setIsListening] = useState(false);
  const dispatch = useDispatch();
  let finalTranscript = '';

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();

  if (!isClient) return null;

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  // Toggle mic on/off:
  const toggleListening = () => {
    if (!isListening) {
      // Turn mic on
      setIsListening(true);
      startListening();
    } else {
      // Turn mic off
      setIsListening(false);
      SpeechRecognition.stopListening();
    }
  };

  const startListening = () => {
    finalTranscript = '';
    SpeechRecognition.startListening({ continuous: false });
    const recognitionInstance = SpeechRecognition.getRecognition();
    if (recognitionInstance) {
      recognitionInstance.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        finalTranscript = transcript;
        console.log('Final Transcript:', finalTranscript);
      };

      recognitionInstance.onend = handleSpeechEnd;
    }
  };

  const handleSpeechEnd = async () => {
    console.log('Speech recognition stopped.');
    console.log({ finalTranscript });
    if (finalTranscript) {
      await sendRequest(finalTranscript);
    }

    
  };

  const sendRequest = async (transcript) => {
    console.log({ transcript });
    if (transcript) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: transcript, sessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          // Assuming your API returns a JSON string that you parse here:
          const apiResponseData = JSON.parse(data.response);
          console.log({ apiResponseData: apiResponseData.response });

          // Call the voice API to read the response aloud:
          callVoiceApi(apiResponseData.response);

          if (apiResponseData && apiResponseData.link) {
            console.log({ link: apiResponseData.link });
            dispatch(setCategory(apiResponseData.link));
          }
          dispatch(setTextResponse(apiResponseData.response));
        } else {
          setApiResponse(`Failed to fetch API: ${response.statusText}`);
        }
      } catch (error) {
        setApiResponse(`Error: ${error.message}`);
      } finally {
        resetTranscript();
      }
    }
  };

  const callVoiceApi = async (textResponse) => {
    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textResponse }),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        setIsListening(false);
      } else {
        const errorResult = await response.json();
        console.error(`Error from Voice API: ${errorResult.error}`);
      }
    } catch (error) {
      console.error(`Error calling Voice API: ${error.message}`);
    }
  };

  return (
    <div>
      { isListening ? (
        <Mic
          className="flex justify-center items-center gap-3"
          onClick={toggleListening}
        />
      ) : (
        <MicOff
          className="flex justify-center items-center gap-3"
          onClick={toggleListening}
        />
      )}
    </div>
  );
};

export default Stt;
