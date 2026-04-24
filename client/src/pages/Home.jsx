import { Link } from "react-router-dom";

import { useAuthStore } from "../store/useAuthStore.js";

export default function Home() {
  const token = useAuthStore((s) => s.token);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Practice interviews that push back.</h1>
      <p className="mt-4 text-lg text-slate-600">
        AI-driven competency interviews with structured feedback. Train for the hard questions.
      </p>
      <div className="mt-8">
        <Link
          to={token ? "/interview" : "/login"}
          className="inline-block rounded bg-slate-900 px-6 py-3 text-white hover:bg-slate-700"
        >
          {token ? "Start an interview" : "Sign in to begin"}
        </Link>
      </div>
    </section>
  );
}
