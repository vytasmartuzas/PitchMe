import { useEffect, useRef, useState } from "react";

import { useInterviewStore } from "../store/useInterviewStore.js";
import { interviewApi } from "../services/api.js";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis.js";

export default function InterviewRoom() {
  const { sessionId, messages, status, appendMessage, setStatus, setFeedback } = useInterviewStore();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(false);
  const bottomRef = useRef(null);
  const lastSpokenRef = useRef(null);

  const { supported: ttsSupported, speaking, speak, cancel } = useSpeechSynthesis();
  const {
    supported: sttSupported,
    listening,
    interim,
    error: sttError,
    start: startListening,
    stop: stopListening,
  } = useSpeechRecognition({
    onResult: (text) => setInput((prev) => (prev ? `${prev} ${text}` : text)),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!voiceOutput || !ttsSupported) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (lastSpokenRef.current === messages.length - 1) return;
    lastSpokenRef.current = messages.length - 1;
    speak(last.content);
  }, [messages, voiceOutput, ttsSupported, speak]);

  const toggleVoiceOutput = () => {
    if (voiceOutput) cancel();
    setVoiceOutput((v) => !v);
  };

  const toggleMic = () => {
    if (listening) stopListening();
    else startListening();
  };

  const send = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending || status !== "active") return;

    if (listening) stopListening();
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
    cancel();
    if (listening) stopListening();
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
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 text-sm">
        <div className="flex items-center gap-3 text-slate-500">
          {speaking && <span className="text-slate-700">🔊 Speaking…</span>}
          {listening && <span className="text-red-600">● Listening…</span>}
        </div>
        <button
          type="button"
          onClick={toggleVoiceOutput}
          disabled={!ttsSupported}
          className="rounded border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          title={ttsSupported ? "" : "Voice output not supported in this browser"}
        >
          {voiceOutput ? "Voice: On" : "Voice: Off"}
        </button>
      </div>

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

      {sttError && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
          Mic error: {sttError}
        </div>
      )}

      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={toggleMic}
          disabled={!sttSupported || status !== "active"}
          className={
            "rounded px-3 py-2 text-white disabled:opacity-40 " +
            (listening ? "bg-red-600 hover:bg-red-500" : "bg-slate-600 hover:bg-slate-500")
          }
          title={sttSupported ? "" : "Voice input not supported in this browser"}
        >
          {listening ? "Stop" : "🎤"}
        </button>
        <input
          className="flex-1 rounded border border-slate-300 px-3 py-2"
          value={listening && interim ? `${input} ${interim}`.trim() : input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? "Listening…" : "Your answer…"}
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
