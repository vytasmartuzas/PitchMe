# PitchMe

AI-powered mock interview platform to help students prepare for interviews.
See [CLAUDE.md](CLAUDE.md) for full architecture.

## Quick start

### Server

```bash
cd server
cp .env.example .env   # fill in GROQ_API_KEY, DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev
```

### Client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Server runs on `:3001`, client on `:5173` (proxies `/api` to the server).
