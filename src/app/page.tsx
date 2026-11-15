"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { MessageCircle } from "lucide-react";
import Layout from "./Dashboard/Layout/Layout";
import Profile from "./Dashboard/Profile/Profile";
import Chatbot from "./Dashboard/Chatbot/Chatbot";
import { endChat, preloadChatAssets } from "./Dashboard/Chatbot/chatClient";
import { setDevice } from "@/redux/deviceSlice";
import { setChatOpen } from "@/redux/chatSlice";
import type { RootState } from "@/redux/store";

const Test: React.FC = () => {
  const dispatch = useDispatch();
  const chatOpen = useSelector((state: RootState) => state.chat.open);
  const chatExpanded = useSelector((state: RootState) => state.chat.expanded);
  const isMobile = useSelector((state: RootState) => state.device.value) === "mobile";
  const router = useRouter();
  const category = useSelector((state: RootState) => state.category.value);
  const path = useSelector((state: RootState) => state.path.value);

  // Get the welcome voice and avatar ready in the background.
  useEffect(() => preloadChatAssets(), []);

  // The chatbot sizes itself by device, same breakpoint as the dashboard.
  useEffect(() => {
    const check = () => dispatch(setDevice(window.innerWidth < 1024 ? "mobile" : "laptop"));
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [dispatch]);

  // When the AI points to a section or project, take the visitor there in the dashboard.
  const initial = useRef({ category, path });
  useEffect(() => {
    if (category !== initial.current.category || path !== initial.current.path) {
      router.push("/Dashboard");
    }
  }, [category, path, router]);

  return (
    <div className={`p-6 font-sans ${chatOpen && isMobile && !chatExpanded ? "pb-[calc(max(25vh,230px)_+_1.5rem)]" : ""}`}>
      {/* Chat with AI: next to the theme toggle (top-right on phones/tablets, bottom-right on desktop) */}
      <button
        onClick={() => (chatOpen ? endChat() : dispatch(setChatOpen(true)))}
        aria-expanded={chatOpen}
        className={`explore-in fixed z-[100] ${chatOpen ? "max-lg:hidden" : ""} top-1 right-12 lg:top-auto lg:bottom-4 lg:right-[4.25rem] h-9 lg:h-11 inline-flex items-center gap-2 px-3.5 lg:px-5 rounded-full bg-accent text-white text-sm font-semibold shadow-lg hover:opacity-90 active:scale-95 transition`}
      >
        <MessageCircle size={16} />
        <span className="lg:hidden">Ask AI</span>
        <span className="hidden lg:inline">Chat with AI</span>
      </button>
      <Chatbot isHovered={chatOpen} variant="floating" onClose={endChat} />

      <div className="flex justify-center md:justify-end items-center mb-4">
       {/*
        <Link
          href="/Metaverse"
          className="relative flex items-center px-9 py-2 border-4 border-customColor hover:text-white font-semibold rounded-3xl shadow-md hover:bg-customColor focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Enter the Metaverse
        </Link>

        */}
      </div>

      <div className="flex flex-col justify-center items-center">
        <div className="w-full md:w-2/3 h-full">
          <Profile />
        </div>

        <Layout />

        {/* Phones: fixed top-left pill (theme toggle is top-right). md+: at the bottom as before. */}
        <div className="explore-in fixed top-2 left-3 z-50 md:z-auto md:absolute md:top-auto md:left-auto md:bottom-5 md:mt-4">
          <Link
            href="/Dashboard"
            className="relative flex items-center px-4 py-1.5 text-sm border-2 border-accent bg-accent text-white md:px-9 md:py-2 md:text-base md:border-4 md:bg-transparent md:text-inherit md:border-customColor hover:bg-accent hover:text-white hover:border-accent font-semibold rounded-3xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <span className="mr-2">Explore</span>
            <span className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 animate-move-right"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes move-right {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(6px);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes explore-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .explore-in {
          animation: explore-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.5s both;
        }

        @media (prefers-reduced-motion: reduce) {
          .explore-in {
            animation: none;
          }
        }

        .animate-move-right {
          animation: move-right 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Test;
