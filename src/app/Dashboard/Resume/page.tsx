"use client";
import { FileText } from "lucide-react";

const PDF = "/ShivamShakyaResume.pdf";

export default function Resume() {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Desktop: the PDF fills the panel. */}
      <iframe src={`${PDF}#zoom=125&navpanes=0`} className="hidden lg:block w-full h-full min-h-[80vh]" title="Resume" />

      {/* Phones/tablets can't reliably preview PDFs inline, so the resume opens in the device's viewer. */}
      <a
        href={PDF}
        target="_blank"
        rel="noopener noreferrer"
        className="lg:hidden m-4 sm:m-8 flex flex-col items-center text-center p-10 rounded-2xl border border-gray-200 bg-white shadow-sm active:scale-[0.99] transition"
      >
        <span className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
          <FileText size={26} />
        </span>
        <p className="mt-4 font-semibold text-gray-900">Shivam Shakya – Resume</p>
        <p className="text-sm text-accent font-medium mt-1">Tap to view</p>
      </a>
    </div>
  );
}
