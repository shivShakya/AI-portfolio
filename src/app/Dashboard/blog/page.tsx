"use client";
import { useEffect, useState } from "react";
//import Link from "next/link";
//import Tilt from "react-parallax-tilt";
//import Image from "next/image";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  console.log({blogPosts});
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch("/blogs/blogs.json"); 
        if (!response.ok) throw new Error("Failed to load blog posts");
        const data: BlogPost[] = await response.json();
        setBlogPosts(data);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      }
    };
    fetchBlogPosts();
  }, []);

  return (
    <div className="flex flex-col justify-start items-center bg-gradient-to-br from-[#211516] to-[#0c1f33] bg-inherit w-full p-1 h-[300vh]">
      <h1 className="text-3xl font-bold text-cyan-50 mb-8">Our Blogs</h1>
      <div className="text-red-500">Work In Progress</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* 
        {blogPosts.map((post) => (
          <Tilt
            glareEnable={true}
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            perspective={500}
            glareColor={"black"}
            key={post.id}
            className="p-4 rounded-2xl shadow-lg bg-white text-customDark flex flex-col hover:scale-[1.02] transition-transform duration-200"
          >
            <Image
              src={post.image}
              alt={post.title}
              width={28}
              height={28}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h3 className="text-xl font-semibold">{post.title}</h3>
            <p className="text-customTextCoor text-sm mt-2">{post.description}</p>
            <Link
              className="mt-auto w-max px-4 py-2 bg-customLight text-[#211516] font-medium rounded-lg hover:bg-[#0c1f33] hover:text-customLight transition-all"
              href={post.link}
            >
              Read More
            </Link>
          </Tilt>
        ))}
          */}
      </div>
    </div>
  );
}
