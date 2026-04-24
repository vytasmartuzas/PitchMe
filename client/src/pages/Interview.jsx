import { useState } from "react";

import RoleSelector from "../components/RoleSelector.jsx";
import InterviewRoom from "../components/InterviewRoom.jsx";
import FeedbackPanel from "../components/FeedbackPanel.jsx";
import { interviewApi } from "../services/api.js";
import { useInterviewStore } from "../store/useInterviewStore.js";

export default function Interview() {
  const { status, feedback, setContext, startSession, reset } = useInterviewStore();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = async ({ role, company }) => {
    setError(null);
    setStarting(true);
    try {
      setContext(role, company);
      const { sessionId, message } = await interviewApi.start({ role, company });
      startSession(sessionId, message);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
    } finally {
      setStarting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {status === "idle" && (
        <>
          <h1 className="text-2xl font-semibold">Start a new interview</h1>
          <RoleSelector onStart={handleStart} disabled={starting} />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </>
      )}

      {(status === "active" || status === "ending") && <InterviewRoom />}

      {status === "ended" && feedback && (
        <>
          <FeedbackPanel feedback={feedback} />
          <button
            onClick={reset}
            className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            New interview
          </button>
        </>
      )}
    </section>
  );
}
