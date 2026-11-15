"use client";
import { useEffect, useState } from "react";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tag: string;
  content: string[];
}

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [progress, setProgress] = useState(0);

  // Reading progress for the open article, based on the dashboard's scroll panel.
  useEffect(() => {
    if (!activePost) return;
    const scroller = document.getElementById("page");
    if (!scroller) return;
    scroller.scrollTo({ top: 0 });
    const onScroll = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      setProgress(max > 0 ? Math.min(scroller.scrollTop / max, 1) : 1);
    };
    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [activePost]);

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
    <div className="flex flex-col justify-start items-center bg-midnight w-full min-h-screen px-4 py-10">
      {activePost ? (
        <article className="relative w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 md:p-10 text-gray-800">
          <div className="sticky top-0 z-10 -mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-6 h-1 bg-gray-100 rounded-t-2xl overflow-hidden" aria-hidden="true">
            <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
          </div>
          <button
            onClick={() => setActivePost(null)}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-6"
          >
            ← Back to all blogs
          </button>
          <span className="inline-block text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
            {activePost.tag}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 leading-tight">
            {activePost.title}
          </h1>
          <p className="text-sm text-gray-500 mt-3">
            Shivam Shakya · {activePost.date} · {activePost.readTime}
          </p>
          <div className="mt-8 space-y-5 text-lg leading-relaxed">
            {activePost.content.map((block, i) =>
              block.startsWith("## ") ? (
                <h2 key={i} className="text-2xl font-bold text-gray-900 pt-4">
                  {block.slice(3)}
                </h2>
              ) : (
                <p key={i}>{block}</p>
              )
            )}
          </div>
        </article>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Blogs</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="p-6 rounded-2xl shadow-lg bg-white text-gray-800 flex flex-col hover:scale-[1.02] transition-transform duration-200"
              >
                <span className="w-max text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  {post.tag}
                </span>
                <h3 className="text-xl font-semibold mt-4">{post.title}</h3>
                <p className="text-xs text-gray-500 mt-2">
                  {post.date} · {post.readTime}
                </p>
                <p className="text-gray-600 text-sm mt-3 mb-6">{post.description}</p>
                <button
                  onClick={() => {
                    setActivePost(post);
                  }}
                  className="mt-auto w-max px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:opacity-90 transition-all"
                >
                  Read More
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
