export default function FeedbackPanel({ feedback }) {
  if (!feedback) return null;

  const scores = [
    ["Overall", feedback.overallScore],
    ["Clarity", feedback.clarity],
    ["Structure (STAR)", feedback.structure],
    ["Specificity", feedback.specificity],
  ];

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-semibold">Feedback</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {scores.map(([label, value]) => (
          <div key={label} className="rounded border border-slate-200 p-3 text-center">
            <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
            <div className="mt-1 text-2xl font-semibold">{value}<span className="text-sm text-slate-400">/10</span></div>
          </div>
        ))}
      </div>
      <div>
        <h3 className="font-medium text-slate-700">Summary</h3>
        <p className="mt-1 whitespace-pre-wrap text-slate-800">{feedback.summary}</p>
      </div>
      <div>
        <h3 className="font-medium text-slate-700">Improvements</h3>
        <p className="mt-1 whitespace-pre-wrap text-slate-800">{feedback.improvements}</p>
      </div>
    </div>
  );
}
