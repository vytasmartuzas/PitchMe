import { useState } from "react";

export default function RoleSelector({ onStart, disabled }) {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!role.trim()) return;
    onStart({ role: role.trim(), company: company.trim() || undefined });
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-slate-700">Job role</label>
        <input
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Software Engineer"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Company (optional)</label>
        <input
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Accenture"
        />
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {disabled ? "Starting…" : "Start interview"}
      </button>
    </form>
  );
}
