import { useEffect, useRef, useState } from "react";

import { useInterviewStore } from "../store/useInterviewStore.js";
import { interviewApi } from "../services/api.js";

export default function InterviewRoom() {
  const { sessionId, messages, status, appendMessage, setStatus, setFeedback } = useInterviewStore();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending || status !== "active") return;

    setInput("");
    appendMessage({ role: "user", content });
    setSending(true);
    try {
      const { message } = await interviewApi.sendMessage({ sessionId, content });
      appendMessage({ role: "assistant", content: message });
    } catch (err) {
      appendMessage({ role: "assistant", content: `Error: ${err.message}` });
    } finally {
      setSending(false);
    }
  };

  const endInterview = async () => {
    if (!sessionId) return;
    setStatus("ending");
    try {
      const { feedback } = await interviewApi.end(sessionId);
      setFeedback(feedback);
    } catch (err) {
      setStatus("active");
      console.error(err);
    }
  };

  return (
    <div className="flex h-[70vh] flex-col rounded-lg border border-slate-200 bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "assistant" ? "text-slate-800" : "text-right"}>
            <div
              className={
                "inline-block max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 " +
                (m.role === "assistant" ? "bg-slate-100" : "bg-slate-900 text-white")
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
        <input
          className="flex-1 rounded border border-slate-300 px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your answer…"
          disabled={status !== "active" || sending}
        />
        <button
          type="submit"
          disabled={status !== "active" || sending || !input.trim()}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          Send
        </button>
        <button
          type="button"
          onClick={endInterview}
          disabled={status !== "active"}
          className="rounded border border-slate-300 px-4 py-2 text-slate-700 disabled:opacity-50"
        >
          End
        </button>
      </form>
    </div>
  );
}
