"use client";
import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { CheckCircle2, Loader2, RotateCcw, Send } from "lucide-react";

type Status = "idle" | "sending" | "sent" | "error";
const MAX_MESSAGE = 1000;

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/shivam-shakya13/", icon: faLinkedin },
  { label: "GitHub", href: "https://github.com/shivShakya", icon: faGithub },
  { label: "Twitter", href: "https://twitter.com/ShivamS76398678", icon: faTwitter },
];

// Floating-label field: the label sits inside the box and moves up on focus / when filled.
function Field({
  name,
  label,
  type = "text",
  textarea,
  value,
  onChange,
}: {
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const base =
    "peer w-full rounded-xl bg-white border border-gray-300 px-4 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition [&:user-invalid]:border-red-400";
  return (
    <div className="relative">
      {textarea ? (
        <textarea
          id={name}
          name={name}
          required
          rows={5}
          maxLength={MAX_MESSAGE}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )}
      <label
        htmlFor={name}
        className="absolute left-4 top-2 text-xs font-medium text-gray-500 transition-all pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent"
      >
        {label}
      </label>
    </div>
  );
}

const Contact: React.FC = () => {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.current) return;
    setStatus("sending");
    try {
      await emailjs.sendForm("service_wjxpy8h", "template_d09n03b", form.current, {
        publicKey: "JrrqjpMZo5cxo5D27",
      });
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error("Error:", error);
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-10 lg:py-16">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Contact</p>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">Let&apos;s Talk.</h1>
        <p className="text-gray-500 mt-3 max-w-md">
          Open to new roles and impact-driven collaborations. I usually reply within a day or two.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
        <aside className="md:col-span-2 space-y-3 order-2 md:order-1">
          <p className="text-sm font-semibold text-gray-900">Or find me on</p>
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:border-accent/50 hover:shadow-md transition-all"
            >
              <span className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                <FontAwesomeIcon icon={s.icon} />
              </span>
              <span className="font-medium text-gray-800">{s.label}</span>
              <span className="ml-auto text-gray-400 group-hover:text-accent group-hover:translate-x-0.5 transition-all">→</span>
            </a>
          ))}
        </aside>

        <div className="md:col-span-3 order-1 md:order-2">
          {status === "sent" ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 rounded-2xl border border-accent/30 bg-accent/5 animate-[contactIn_500ms_cubic-bezier(0.16,1,0.3,1)_backwards]">
              <CheckCircle2 size={48} className="text-accent" />
              <h2 className="text-xl font-semibold text-gray-900 mt-4">Message sent!</h2>
              <p className="text-gray-500 mt-1">Thanks for reaching out. I&apos;ll get back to you soon.</p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
              >
                <RotateCcw size={14} /> Send another
              </button>
            </div>
          ) : (
            <form ref={form} onSubmit={sendEmail} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field name="user_name" label="Your name" value={name} onChange={setName} />
                <Field name="user_email" label="Email address" type="email" value={email} onChange={setEmail} />
              </div>
              <div>
                <Field name="message" label="What would you like to talk about?" textarea value={message} onChange={setMessage} />
                <p className="text-right text-xs text-gray-400 mt-1.5">
                  {message.length}/{MAX_MESSAGE}
                </p>
              </div>

              {status === "error" && (
                <p role="alert" className="text-sm rounded-xl px-4 py-3 bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
                  Something went wrong sending your message. Please try again, or reach me on LinkedIn.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-accent text-white font-semibold hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Send message <Send size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes contactIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;
