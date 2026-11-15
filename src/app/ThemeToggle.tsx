"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setIsDark(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="fixed top-1 right-2 w-9 h-9 lg:top-auto lg:bottom-4 lg:right-4 lg:w-11 lg:h-11 z-[100] rounded-full flex items-center justify-center bg-surface text-ink border border-gray-300 shadow-lg hover:scale-105 transition-transform"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
