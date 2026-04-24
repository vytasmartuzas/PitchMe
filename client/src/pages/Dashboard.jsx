import { useEffect, useState } from "react";

import { feedbackApi } from "../services/api.js";

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    feedbackApi
      .list()
      .then((d) => setSessions(d.sessions))
      .catch((err) => setError(err.response?.data?.error ?? err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Past sessions</h1>
      {loading && <p className="mt-4 text-slate-500">Loading…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !sessions.length && <p className="mt-4 text-slate-500">No sessions yet.</p>}

      <ul className="mt-6 space-y-3">
        {sessions.map((s) => (
          <li key={s.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {s.role}
                  {s.company ? ` — ${s.company}` : ""}
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(s.startedAt).toLocaleString()}
                </div>
              </div>
              {s.feedback ? (
                <div className="text-right">
                  <div className="text-xs text-slate-500">Overall</div>
                  <div className="text-xl font-semibold">{s.feedback.overallScore}/10</div>
                </div>
              ) : (
                <span className="text-xs text-slate-400">No feedback</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
