import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

// One conversation shared by typing and voice, on every page (home and dashboard).
export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "event" | "error";
  text: string;
  /** For "event" messages: the page the AI opened. */
  target?: { kind: "link" | "path"; value: string };
};

/** thinking: waiting for the answer. voicing: answer shown, spoken audio being prepared. */
export type ChatPhase = "idle" | "thinking" | "voicing";

type ChatState = {
  sessionId: string;
  messages: ChatMessage[];
  phase: ChatPhase;
  open: boolean;
  /** Phones/tablets: chat expanded to full screen instead of the bottom sheet. */
  expanded: boolean;
  voiceOn: boolean;
  greeted: boolean;
};

const newSessionId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : nanoid();

const initialState: ChatState = {
  sessionId: newSessionId(),
  messages: [],
  phase: "idle",
  open: false,
  expanded: false,
  voiceOn: false,
  greeted: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Omit<ChatMessage, "id">>) => {
      state.messages.push({ id: nanoid(), ...action.payload });
    },
    setPhase: (state, action: PayloadAction<ChatPhase>) => {
      state.phase = action.payload;
    },
    setChatOpen: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload;
    },
    setChatExpanded: (state, action: PayloadAction<boolean>) => {
      state.expanded = action.payload;
    },
    setVoiceOn: (state, action: PayloadAction<boolean>) => {
      state.voiceOn = action.payload;
    },
    markGreeted: (state) => {
      state.greeted = true;
    },
    /** Add the welcome message, at most once per session (safe to call repeatedly). */
    greet: (state, action: PayloadAction<string>) => {
      if (state.greeted) return;
      state.greeted = true;
      state.messages.push({ id: nanoid(), role: "assistant", text: action.payload });
    },
    /** End the conversation: fresh session, no messages, greet again next time. */
    resetChat: (state) => {
      state.sessionId = newSessionId();
      state.messages = [];
      state.phase = "idle";
      state.greeted = false;
      state.expanded = false;
    },
  },
});

export const { addMessage, setPhase, setChatOpen, setChatExpanded, setVoiceOn, markGreeted, greet, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
