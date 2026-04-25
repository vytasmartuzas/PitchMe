import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRouter from "./routes/auth.js";
import interviewRouter from "./routes/interview.js";
import feedbackRouter from "./routes/feedback.js";

const app = express();

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://localhost",
  "https://localhost",
  "capacitor://localhost",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/feedback", feedbackRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message ?? "Internal error" });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`PitchMe server listening on :${port}`));
