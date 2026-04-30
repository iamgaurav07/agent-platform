# AgentFlow 🤖

A full-stack AI agent platform where users can create, configure, and run AI agents with real tools — web search, code execution, and more. Built as a portfolio project to demonstrate production-grade full-stack engineering.

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Postgres](https://img.shields.io/badge/Postgres-4169E1?style=flat&logo=postgresql&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)

## Features

- 🔐 GitHub OAuth authentication via NextAuth.js
- 🤖 Create and configure custom AI agents with system prompts
- 🔧 Built-in tools — web search and calculator
- ⚡ Real-time streaming responses token by token
- 🗄️ Postgres database with Drizzle ORM
- 🔁 Type-safe API layer with tRPC + Zod validation
- 🐳 Fully dockerized local development

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Backend | Next.js API Routes, tRPC |
| AI | OpenAI API, Vercel AI SDK |
| Database | PostgreSQL, Drizzle ORM |
| Auth | NextAuth.js (GitHub OAuth) |
| Queue | Redis, BullMQ (coming soon) |
| Infra | Docker Compose |

## Architecture

```
┌─────────────────────────────────────────┐
│              Next.js App                │
│                                         │
│  ┌──────────┐      ┌──────────────────┐ │
│  │ Frontend │ ───► │  tRPC Routers    │ │
│  │  React   │      │  (type-safe API) │ │
│  └──────────┘      └────────┬─────────┘ │
│                             │           │
│                    ┌────────▼─────────┐ │
│                    │   Drizzle ORM    │ │
│                    └────────┬─────────┘ │
└─────────────────────────────┼───────────┘
                              │
              ┌───────────────▼──────────┐
              │      PostgreSQL          │
              │   users, agents, runs    │
              └──────────────────────────┘
```

## Getting Started

### Prerequisites
- Node.js 20+
- Docker Desktop

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/agent-platform.git
cd agent-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your values in .env.local

# Start Docker services
docker compose up -d

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/agentdb
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
OPENAI_API_KEY=your-openai-api-key
```

## Project Structure

```
agent-platform/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (auth, trpc, chat)
│   ├── agents/             # Agent pages (create, chat)
│   ├── dashboard/          # Dashboard page
│   └── login/              # Login page
├── db/                     # Database (Drizzle schema + client)
├── server/                 # tRPC routers
│   └── routers/            # agents router
├── lib/                    # Shared utilities (trpc client)
└── docker-compose.yml      # Local dev services
```

## Roadmap

- [ ] Real web search via Tavily API
- [ ] Sandboxed code execution
- [ ] BullMQ background job queue
- [ ] pgvector long-term memory
- [ ] Run history and token usage tracking
- [ ] Deploy to Railway

## License

MIT