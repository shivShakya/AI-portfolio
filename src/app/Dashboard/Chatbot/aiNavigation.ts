import type { Dispatch } from "@reduxjs/toolkit";
import { setCategory } from "@/redux/categorySlice";
import { setPath } from "@/redux/pathSlice";

export type AiReply = { response: string; link?: string; path?: string[]; pathTitle?: string };

const SECTION_NAMES: Record<string, string> = {
  project: "Projects",
  blog: "Blog",
  education: "Education",
  experience: "Experience",
  contact: "Contact",
  skills: "Skills",
  resume: "Resume",
  portfolio: "Portfolio",
};

// Open the section or project the AI pointed to, and return a short notice for the chat (or null).
// Project paths get a unique suffix: the detail page strips the last "-…" part, and the suffix
// also lets the same project be opened twice in a row.
export function applyAiNavigation(dispatch: Dispatch, reply: AiReply) {
  if (reply.link) dispatch(setCategory(reply.link));
  const project = reply.path?.[0];
  dispatch(setPath(project ? `${project}-${Date.now()}` : ""));

  if (project) return { text: `Opened project: ${reply.pathTitle || project}`, target: { kind: "path" as const, value: project } };
  if (reply.link) return { text: `Opened ${SECTION_NAMES[reply.link] ?? reply.link}`, target: { kind: "link" as const, value: reply.link } };
  return null;
}
