import { chat } from "./groq.js";

const FEEDBACK_PROMPT = `You are an expert interview coach. Review the transcript and return STRICT JSON only, no prose, matching this shape:
{
  "overallScore": number (1-10),
  "clarity": number (1-10),
  "structure": number (1-10),
  "specificity": number (1-10),
  "summary": string,
  "improvements": string
}
"structure" measures STAR adherence. "improvements" should be a short bulleted string (use "- " prefixes).`;

export async function generateFeedback(transcript) {
  const convo = transcript.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
  const raw = await chat(
    [
      { role: "system", content: FEEDBACK_PROMPT },
      { role: "user", content: `Transcript:\n\n${convo}` },
    ],
    { temperature: 0.2 },
  );

  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("Feedback model did not return JSON");
  return JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
}
