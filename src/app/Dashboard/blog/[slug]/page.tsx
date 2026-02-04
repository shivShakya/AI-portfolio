"use client";
import { useEffect, useState } from "react";

interface Metadata {
  author: string;
  date: string;
  tags: string[];
}

interface Subsection {
  subheading: string;
  content: string;
}

interface Section {
  heading: string;
  content: string;
  subsections?: Subsection[];
}

interface Blog {
  title: string;
  metadata: Metadata;
  sections: Section[];
}

export default function BlogPost() {
  const [blog, setBlog] = useState<Blog | null>(null);

  useEffect(() => {
    fetch("/blogs/blogs.json")
      .then((response) => response.json())
      .then((data) => setBlog(data.blog))
      .catch((error) => console.error("Error loading blog data:", error));
  }, []);

  if (!blog) return <div className="text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{blog.title}</h1>
      <div className="text-sm text-gray-500 mb-6">
        <p>
          <strong>Author:</strong> {blog.metadata.author}
        </p>
        <p>
          <strong>Date:</strong> {blog.metadata.date}
        </p>
        <p>
          <strong>Tags:</strong> {blog.metadata.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mr-2"
            >
              {tag}
            </span>
          ))}
        </p>
      </div>
      <div className="space-y-8">
        {blog.sections.map((section, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {section.heading}
            </h2>
            <p className="text-gray-600 mb-4">{section.content}</p>
            {section.subsections &&
              section.subsections.map((sub, subIndex) => (
                <div key={subIndex} className="mt-6">
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    {sub.subheading}
                  </h3>
                  <p className="text-gray-600">{sub.content}</p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
