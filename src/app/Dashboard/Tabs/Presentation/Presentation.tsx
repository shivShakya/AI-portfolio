'use client';

import { useState } from 'react';

const Presentation = () => {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPresentation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: 'Generate a presentation', sessionId: 'session_123' }),
      });
      
      const data = await res.json();
      setResponse(data.response || 'No response received');
    } catch (error) {
      console.error('Error fetching presentation:', error);
      setResponse('Error fetching presentation. Please try again.');
    }
    setLoading(false);
  };

  return (
      <button 
        onClick={fetchPresentation} 
        className="bg-[#F1F1F1] rounded-full px-2 py-1 text-center text-black font-medium text-sm shadow-sm hover:bg-gray-300 cursor-pointer"
        disabled={loading}
      >
         Presentation
      </button>
  );
};

export default Presentation;