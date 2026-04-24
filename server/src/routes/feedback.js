import { Router } from "express";

import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/sessions", async (req, res, next) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.user.id },
      orderBy: { startedAt: "desc" },
      include: { feedback: true },
    });
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
});

router.get("/:sessionId", async (req, res, next) => {
  try {
    const session = await prisma.session.findFirst({
      where: { id: req.params.sessionId, userId: req.user.id },
      include: { feedback: true, messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

export default router;
