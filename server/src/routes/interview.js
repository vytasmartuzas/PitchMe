import { Router } from "express";
import { z } from "zod";

import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { buildSystemPrompt, chat } from "../services/groq.js";
import { generateFeedback } from "../services/feedback.js";

const router = Router();

router.use(requireAuth);

const startSchema = z.object({
  role: z.string().min(1),
  company: z.string().optional(),
});

const messageSchema = z.object({
  sessionId: z.string().uuid(),
  content: z.string().min(1),
});

const endSchema = z.object({
  sessionId: z.string().uuid(),
});

async function loadSessionOrThrow(sessionId, userId) {
  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) {
    const err = new Error("Session not found");
    err.status = 404;
    throw err;
  }
  return session;
}

router.post("/start", validate(startSchema), async (req, res, next) => {
  try {
    const { role, company } = req.body;
    const session = await prisma.session.create({
      data: { userId: req.user.id, role, company: company ?? null },
    });

    const system = buildSystemPrompt(role, company);
    const opening = await chat([{ role: "system", content: system }]);

    await prisma.message.create({
      data: { sessionId: session.id, role: "assistant", content: opening },
    });

    res.status(201).json({ sessionId: session.id, message: opening });
  } catch (err) {
    next(err);
  }
});

router.post("/message", validate(messageSchema), async (req, res, next) => {
  try {
    const { sessionId, content } = req.body;
    const session = await loadSessionOrThrow(sessionId, req.user.id);
    if (session.endedAt) return res.status(409).json({ error: "Session already ended" });

    await prisma.message.create({ data: { sessionId, role: "user", content } });

    const history = [
      { role: "system", content: buildSystemPrompt(session.role, session.company) },
      ...session.messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content },
    ];

    const reply = await chat(history);

    await prisma.message.create({ data: { sessionId, role: "assistant", content: reply } });

    res.json({ message: reply });
  } catch (err) {
    next(err);
  }
});

router.post("/end", validate(endSchema), async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const session = await loadSessionOrThrow(sessionId, req.user.id);
    if (session.endedAt) return res.status(409).json({ error: "Session already ended" });

    const fb = await generateFeedback(session.messages);

    const [, feedback] = await prisma.$transaction([
      prisma.session.update({ where: { id: sessionId }, data: { endedAt: new Date() } }),
      prisma.feedback.create({
        data: {
          sessionId,
          overallScore: fb.overallScore,
          clarity: fb.clarity,
          structure: fb.structure,
          specificity: fb.specificity,
          summary: fb.summary,
          improvements: fb.improvements,
        },
      }),
    ]);

    res.json({ feedback });
  } catch (err) {
    next(err);
  }
});

export default router;
