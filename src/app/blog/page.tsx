"use client"
import Link from "next/link";
import Tilt from 'react-parallax-tilt';


export default function Blog() {
   const blogPosts = [
     {
       id: 1,
       title: "The Art of Mindfulness",
       description:
         "Discover how mindfulness can improve your daily life and help you find peace in the chaos.",
       image: "https://via.placeholder.com/300x200",
       link: "/blog/post/1"
     },
     {
       id: 2,
       title: "Top 10 Travel Destinations",
       description:
         "Explore the must-visit travel destinations for 2025. From tropical beaches to mountain escapes.",
       image: "https://via.placeholder.com/300x200",
       link: "/blog/post/2"
     },
     {
       id: 3,
       title: "The Future of AI",
       description:
         "How artificial intelligence is shaping industries and what to expect in the coming years.",
       image: "https://via.placeholder.com/300x200",
       link: "/blog/post/3"
     },
     {
       id: 4,
       title: "Healthy Eating Tips",
       description:
         "Learn practical tips to maintain a healthy diet while still enjoying your favorite foods.",
       image: "https://via.placeholder.com/300x200",
       link: "/blog/post/4"
     },
     {
       id: 5,
       title: "Mastering Remote Work",
       description:
         "Tips and tools to stay productive while working from home or any remote location.",
       image: "https://via.placeholder.com/300x200",
       link: "/blog/post/5"
     },
     {
       id: 6,
       title: "Sustainable Living",
       description:
         "Simple steps to reduce your carbon footprint and lead a more sustainable lifestyle.",
       image: "https://via.placeholder.com/300x200",
       link: "/blog/post/5"
     },
     {
       id: 7,
       title: "Exploring Space",
       description:
         "A journey through the latest discoveries in space exploration and astronomy.",
       image: "https://via.placeholder.com/300x200",
       link: "/blog/post/5"
     },
     {
       id: 8,
       title: "Fitness for Beginners",
       description:
         "Your guide to starting a fitness routine and staying motivated for a healthier you.",
       image: "https://via.placeholder.com/300x200",
       link: "/blog/post/5"
     },
     {
       id: 9,
       title: "The Evolution of Gaming",
       description:
         "How video games have transformed over the decades and what's next for gamers.",
       image: "https://via.placeholder.com/300x200",
       link: "/blog/post/5"
     },
     {
       id: 10,
       title: "Personal Finance Tips",
       description:
         "Learn how to manage your money better and plan for a financially secure future.",
       image: "https://via.placeholder.com/300x200",
       link: "/blog/post/5"
     },
   ];
 
   return (
    <div className="flex flex-col justify-start items-center bg-gradient-to-br from-[#211516] to-[#0c1f33] bg-inherit  w-full p-1 h-[300vh]">
     <h1 className="text-3xl font-bold text-cyan-50 mb-8">Our Blogs</h1>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
       {blogPosts.map((post) => (
           <Tilt
           glareEnable={true}  tiltMaxAngleX={10} 
           tiltMaxAngleY={10} perspective={500}
           glareColor={"black"}
             key={post.id}
             className="p-4 rounded-2xl shadow-lg bg-white text-customDark flex flex-col hover:scale-[1.02] transition-transform duration-200"
           >
           <img
             src={post.image}
             alt={post.title}
             className="w-full h-40 object-cover rounded-md mb-4"
           />
           <h3 className="text-xl font-semibold">{post.title}</h3>
           <p className="text-customTextCoor text-sm mt-2">{post.description}</p>
           <Link className="mt-auto w-max px-4 py-2 bg-customLight text-[#211516] font-medium rounded-lg hover:bg-[#0c1f33] hover:text-customLight transition-all" href={post.link}>
             Read More
           </Link>
         </Tilt>
       ))}
     </div>
     </div>
   );
 }
 