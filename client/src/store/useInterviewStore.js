import { create } from "zustand";

export const useInterviewStore = create((set) => ({
  sessionId: null,
  role: "",
  company: "",
  messages: [],
  status: "idle",
  feedback: null,

  setContext: (role, company) => set({ role, company }),
  startSession: (sessionId, opening) =>
    set({
      sessionId,
      messages: [{ role: "assistant", content: opening }],
      status: "active",
      feedback: null,
    }),
  appendMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),
  setStatus: (status) => set({ status }),
  setFeedback: (feedback) => set({ feedback, status: "ended" }),
  reset: () =>
    set({ sessionId: null, role: "", company: "", messages: [], status: "idle", feedback: null }),
}));
