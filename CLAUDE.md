# PitchMe — CLAUDE.md

> AI-powered mock interview web app. Users practice competency-based interviews with an AI interviewer that asks follow-up questions, pushes back on vague answers, and delivers structured feedback.

---

## Project Goal

Build a production-ready mock interview platform, starting with a lean MVP and growing toward B2B university licensing and recruiter partnerships.

---

## Tech Stack

### Backend

| Layer       | Choice                       | Reason                                                      |
| ----------- | ---------------------------- | ----------------------------------------------------------- |
| Runtime     | **Node.js 20+**              | Familiar, fast for I/O-heavy AI streaming                   |
| Framework   | **Express.js**               | Lightweight, flexible, already in use                       |
| AI Provider | **Groq API** (Llama 3.3 70B) | Fast inference, generous free tier, good for real-time feel |
| Auth        | **JWT + bcrypt**             | Stateless, simple to implement, already used in LBAS        |
| Database    | **PostgreSQL**               | Relational, reliable, familiar from LBAS                    |
| ORM         | **Prisma**                   | Type-safe queries, easy migrations, great DX                |
| Validation  | **Zod**                      | Schema validation for request bodies                        |
| Environment | **dotenv**                   | Secrets management                                          |

### Frontend

| Layer        | Choice                               | Reason                                                    |
| ------------ | ------------------------------------ | --------------------------------------------------------- |
| Framework    | **React 18**                         | Familiar, component model suits interview UI              |
| Bundler      | **Vite**                             | Fast HMR, simple config                                   |
| Styling      | **Tailwind CSS**                     | Rapid UI iteration                                        |
| State        | **Zustand**                          | Lightweight global state (session, user, interview state) |
| HTTP client  | **Axios**                            | Clean API calls with interceptors for auth headers        |
| Voice input  | **Web Speech API** (browser-native)  | No cost, MVP-ready, works in Chrome                       |
| Voice output | **Web Speech API — SpeechSynthesis** | Optional: read interviewer questions aloud                |

### Infrastructure (MVP → Production)

| Stage        | Choice                                                                     |
| ------------ | -------------------------------------------------------------------------- |
| MVP local    | `localhost` — Node + Vite dev servers                                      |
| MVP deploy   | **Railway** (backend) + **Vercel** (frontend)                              |
| DB hosting   | **Railway PostgreSQL** or **Supabase**                                     |
| Future scale | Consider **Redis** for session caching, **BullMQ** for async feedback jobs |

### Dev Tooling

- **ESLint + Prettier** — code quality
- **Nodemon** — backend hot reload
- **Postman / Thunder Client** — API testing
- **Git** — version control (this repo)

---

## Repository Structure

```
pitchme/
├── server/                  # Express backend
│   ├── src/
│   │   ├── routes/          # Express routers
│   │   │   ├── auth.js      # Register, login, JWT issue
│   │   │   ├── interview.js # Start session, send message, end session
│   │   │   └── feedback.js  # Retrieve session feedback
│   │   ├── controllers/     # Route handler logic
│   │   ├── services/
│   │   │   ├── groq.js      # Groq API wrapper, system prompt builder
│   │   │   └── feedback.js  # Post-session scoring logic
│   │   ├── middleware/
│   │   │   ├── auth.js      # JWT verify middleware
│   │   │   └── validate.js  # Zod request validation
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── app.js           # Express app setup
│   ├── .env                 # GROQ_API_KEY, DATABASE_URL, JWT_SECRET
│   └── package.json
│
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── InterviewRoom.jsx   # Main chat/voice UI
│   │   │   ├── FeedbackPanel.jsx   # Post-session summary
│   │   │   ├── RoleSelector.jsx    # Job role + company input
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Interview.jsx
│   │   │   └── Dashboard.jsx       # Past sessions, scores
│   │   ├── store/
│   │   │   └── useInterviewStore.js  # Zustand store
│   │   ├── services/
│   │   │   └── api.js               # Axios instance + endpoints
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── CLAUDE.md
└── README.md
```

---

## Core Data Models (Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  sessions  Session[]
  createdAt DateTime @default(now())
}

model Session {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  role      String    // e.g. "Software Engineer"
  company   String?   // e.g. "Accenture"
  messages  Message[]
  feedback  Feedback?
  startedAt DateTime  @default(now())
  endedAt   DateTime?
}

model Message {
  id        String   @id @default(uuid())
  sessionId String
  session   Session  @relation(fields: [sessionId], references: [id])
  role      String   // "user" | "assistant"
  content   String
  createdAt DateTime @default(now())
}

model Feedback {
  id            String  @id @default(uuid())
  sessionId     String  @unique
  session       Session @relation(fields: [sessionId], references: [id])
  overallScore  Int     // 1–10
  clarity       Int
  structure     Int     // STAR method adherence
  specificity   Int
  summary       String  // AI-generated paragraph
  improvements  String  // Bullet points of advice
}
```

---

## API Routes

```
POST   /api/auth/register
POST   /api/auth/login

POST   /api/interview/start       # { role, company } → returns sessionId + opening question
POST   /api/interview/message     # { sessionId, content } → returns next AI question
POST   /api/interview/end         # { sessionId } → triggers feedback generation

GET    /api/feedback/:sessionId   # Returns Feedback object
GET    /api/sessions              # Returns user's past sessions (auth required)
```

---

## AI / Groq Service

The system prompt is the core of the product. Build it dynamically from session context:

```js
// server/src/services/groq.js

function buildSystemPrompt(role, company) {
  return `You are a senior hiring manager conducting a competency-based interview for a ${role} role${company ? ` at ${company}` : ""}.

Rules:
- Ask one question at a time. Never ask multiple questions in a single turn.
- If the candidate gives a vague or generic answer, ask for a specific real-life example.
- Probe for the STAR structure (Situation, Task, Action, Result) without explicitly naming it.
- Be professional, direct, and fair. Not hostile. Not easy.
- After 6–8 exchanges, wrap up naturally and say the interview is complete.
- Do not break character. Do not discuss your own nature as an AI.

Start by greeting the candidate, confirming the role, and asking your first question.`;
}
```

---

## Environment Variables

```env
# server/.env
GROQ_API_KEY=gsk_...
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_here
PORT=3001
```

---

## MVP Build Order

1. **Backend skeleton** — Express, routes wired, health check responding
2. **Groq integration** — `/api/interview/start` and `/api/interview/message` working end-to-end
3. **Auth** — register/login, JWT middleware on protected routes
4. **DB + Prisma** — schema applied, messages persisting to PostgreSQL
5. **Frontend core** — RoleSelector → InterviewRoom chat loop working
6. **Feedback generation** — post-session scoring prompt, FeedbackPanel UI
7. **Dashboard** — past sessions list, revisit feedback
8. **Voice input** — Web Speech API layer on top of text input
9. **Polish + deploy** — Railway + Vercel

---

## Known Decisions & Constraints

- Groq free tier has rate limits — add basic request throttling from day one
- Web Speech API only works over HTTPS in production — ensure SSL on Railway
- Keep conversation history in Zustand on the client and send full history to `/message` — Groq/Llama has no memory between calls
- The system prompt is the product — iterate on it constantly

---

## Future Roadmap

| Phase          | Focus                                                              |
| -------------- | ------------------------------------------------------------------ |
| MVP            | Core interview loop, feedback, auth, deploy                        |
| v2             | Role-specific question banks, CV upload for personalised questions |
| B2B            | University licensing portal, admin dashboard, bulk seat management |
| Recruiter tier | Custom company personas, candidate scoring exports                 |
