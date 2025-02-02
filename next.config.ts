import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    GROQ_API_KEY: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  },
};

export default nextConfig;
