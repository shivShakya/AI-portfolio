"use client"
import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

const Contact: React.FC = () => {
  const form = useRef<HTMLFormElement>(null);
  const [success, setSuccess] = useState(false);

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.current) {
      emailjs
        .sendForm('service_3kpt7pq', 'template_nfjsijb', form.current, {
          publicKey: 'FgE_X1StGZ8R9N8g9',
        })
        .then(() => {
          setSuccess(true);
          console.log('SUCCESS!');
          // Reset the form fields
          if(form.current){
            form.current.reset();
          }

          // Optionally, clear the success message after 5 seconds
          setTimeout(() => {
            setSuccess(false);
          }, 5000);
        })
        .catch((error) => {
          console.error('FAILED...', error);
        });
    }
  };

  return (
    <div className="flex flex-col justify-start items-center w-full h-full bg-gradient-to-br from-[#211516] to-[#0c1f33] p-6 space-y-8">
      <div className="text-center text-white mt-8 md:mt-2 ">
        <div className="flex justify-center space-x-4">
          <a href="https://twitter.com/example" className="hover:underline">
            Twitter
          </a>
          <a href="https://instagram.com/example" className="hover:underline">
            Instagram
          </a>
        </div>
        <p className="text-lg font-medium">Phone: 8318357977</p>
        <p className="text-lg font-medium">Email: shivdu2000@gmail.com</p>
      </div>

      <div className="bg-[rgb(250,250,250)] p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#1E8787] opacity-5 rounded-3xl"></div>

        <h1 className="text-4xl font-bold text-[#0c1f33] mb-8 text-center relative z-10">
          Get in Touch
        </h1>
        <form ref={form} onSubmit={sendEmail} className="space-y-6 relative z-10">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#333]">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="user_name"
              className="mt-2 block w-full p-3 border border-gray-300 rounded-lg shadow-md bg-white focus:ring-[#1E8787] focus:border-[#1E8787]"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#333]">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="user_email"
              className="mt-2 block w-full p-3 border border-gray-300 rounded-lg shadow-md bg-white focus:ring-[#1E8787] focus:border-[#1E8787]"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-[#333]">
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              className="mt-2 block w-full p-3 border border-gray-300 rounded-lg shadow-md bg-white focus:ring-[#1E8787] focus:border-[#1E8787]"
              placeholder="Type your message here..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#1E8787] to-[#0c1f33] text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            Send Message
          </button>
          {success && (
            <div className="mt-4 text-center text-green-600 font-semibold">
              Your message has been sent successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Contact;

