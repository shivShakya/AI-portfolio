"use client";
import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
//import { collection, addDoc } from "firebase/firestore";
//import { db } from "../firebase";

const Contact: React.FC = () => {
  const form = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (form.current) {
      try {
       // const formData = new FormData(form.current);
        await emailjs.sendForm("service_wjxpy8h", "template_d09n03b", form.current, {
          publicKey: "JrrqjpMZo5cxo5D27",
        });

        /*
        await addDoc(collection(db, "contacts"), {
          name: formData.get("user_name"),
          email: formData.get("user_email"),
          message: formData.get("message"),
          timestamp: new Date(),
        });

        */
        setSuccess(true);
        form.current.reset();
        setTimeout(() => setSuccess(false), 5000);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto  p-10 md:p-8 bg-white min-h-[80vh] flex flex-col justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        
        {/* Left Side: Context */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tighter mb-3 md:mb-4">
            Let’s Talk.
          </h1>
          <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-xs md:max-w-full">
            Open to new roles and impact-driven collaborations.
          </p>
        </div>

        {/* Right Side: Form */}
        <form ref={form} onSubmit={sendEmail} className="space-y-4 md:space-y-5">
          <input
            required
            type="text"
            name="user_name"
            placeholder="Name"
            className="w-full px-0 py-2 md:py-3 bg-transparent border-b-2 border-gray-100 outline-none focus:border-black transition-colors placeholder:text-gray-300 text-sm md:text-base"
          />
          
          <input
            required
            type="email"
            name="user_email"
            placeholder="Email"
            className="w-full px-0 py-2 md:py-3 bg-transparent border-b-2 border-gray-100 outline-none focus:border-black transition-colors placeholder:text-gray-300 text-sm md:text-base"
          />

          <textarea
            required
            rows={3}
            name="message"
            placeholder="Your Message"
            className="w-full px-0 py-2 md:py-3 bg-transparent border-b-2 border-gray-100 outline-none focus:border-black transition-colors resize-none placeholder:text-gray-300 text-sm md:text-base"
          ></textarea>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto mt-4 px-8 py-3 bg-black text-white text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-400 transition-all"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>

          {success && (
            <p className="text-xs md:text-sm font-medium text-green-600 animate-pulse mt-2">
              ✓ Message sent.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Contact;