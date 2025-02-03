"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setCategory } from "../../redux/categorySlice";
import { Loader2 } from "lucide-react";

function TextBot() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

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
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const data = await res.json();
      const response = JSON.parse(data.response);
      if (response && response.link) {
        console.log({ link: response.link });
        dispatch(setCategory(response.link));
      }
      setResponse(response.response);
      setInput("");
    } catch (err) {
      setError("Failed to get response. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-1 mt-2 bg-white">
      <div className="border border-customColor rounded-lg w-full h-64 max-h-64 mb-6 p-4 overflow-y-auto bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin text-customColor w-8 h-8" />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <p className="text-customBlue whitespace-pre-wrap">
            {response || "No response yet."}
          </p>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3 w-full">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 p-3 border border-customBlue text-customTextCoor rounded-lg focus:outline-none focus:ring-2 focus:ring-customColor"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-4 py-3 bg-customColor text-white rounded-lg hover:bg-customBlue focus:outline-none disabled:opacity-50"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? "Generate" : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default TextBot;
