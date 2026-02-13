"use client"
export default function Resume() {
    return (
      <div className="flex flex-col w-full h-screen items-center justify-center">
        <div className="w-full  h-full border-2 border-gray-300 shadow-lg">
          <iframe
            src="/ShivamShakyaResume.pdf"
            className="w-full h-full"
            title="Resume"
          ></iframe>
        </div>
      </div>
    );
  }
  