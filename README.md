# AgentFlow 🤖

> A production-ready full-stack AI agent platform. Create custom AI agents, give them tools and documents, and watch them work in real time.

🔗 **Live Demo**: https://agent-platform-production-6865.up.railway.app
📂 **GitHub**: https://github.com/iamgaurav07/agent-platform

---

## What is AgentFlow?

AgentFlow lets you create AI agents with custom personalities, tools, and knowledge. Each agent can search the web, perform calculations, and answer questions from your own uploaded documents — all in real time with streaming responses.

---

## Features

- 🔐 **GitHub OAuth** — secure login via NextAuth v5
- 🤖 **Custom AI agents** — configure system prompt, model, and tools per agent
- 🔍 **Web search** — agents search the web in real time via Tavily API
- 🧮 **Calculator tool** — agents solve math problems with sandboxed execution
- 📚 **RAG knowledge base** — upload PDFs, CSVs, TXT files and ask questions from your own data
- ⚡ **Streaming chat** — token-by-token responses with live tool call visibility
- 💾 **Persistent history** — chat history saved to database per agent
- 📊 **Usage tracking** — token usage and run history per user
- ✏️ **Full agent management** — create, edit, delete agents
- 🚀 **Production deployed** — Railway with Postgres, Redis, CI/CD on push

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| AI | OpenAI API, Vercel AI SDK |
| Vector Search | pgvector (RAG) |
| API Layer | tRPC + Zod |
| Database | PostgreSQL + Drizzle ORM |
| Auth | NextAuth.js v5 (GitHub OAuth) |
| Styling | Tailwind CSS + inline styles |
| Infra | Docker, Railway |
| Search | Tavily API |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Next.js 15 App                  │
│                                                  │
│  ┌─────────────┐     ┌──────────────────────┐   │
│  │  React UI   │────▶│   tRPC API Layer     │   │
│  │  (Client)   │     │   (Type-safe routes) │   │
│  └─────────────┘     └──────────┬───────────┘   │
│                                 │                │
│  ┌──────────────────────────────▼─────────────┐ │
│  │              AI Agent Loop                  │ │
│  │  User message → Tool selection → Execute   │ │
│  │  → Observe → Final response (streaming)    │ │
│  └──────────────────────────────┬─────────────┘ │
│                                 │                │
│  ┌──────────────┐  ┌────────────▼─────────────┐ │
│  │  pgvector    │  │      Drizzle ORM          │ │
│  │  (RAG search)│  │   (agents, runs,          │ │
│  └──────────────┘  │    messages, documents)   │ │
│                    └──────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Docker Desktop
- OpenAI API key
- Tavily API key
- GitHub OAuth app

### Installation

```bash
# Clone the repo
git clone https://github.com/iamgaurav07/agent-platform.git
cd agent-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your values

# Start Docker services
docker compose up -d

# Enable pgvector extension
docker exec -it agent-platform-db-1 psql -U postgres -d agentdb -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/agentdb
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your-secret-here
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
OPENAI_API_KEY=your-openai-key
TAVILY_API_KEY=your-tavily-key
```

---

## Project Structure

```
agent-platform/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth handlers
│   │   ├── chat/          # AI streaming endpoint
│   │   └── knowledge/     # RAG upload + search
│   ├── agents/
│   │   └── [id]/
│   │       ├── page.tsx        # Chat interface
│   │       ├── edit/           # Edit agent
│   │       └── knowledge/      # Knowledge base UI
│   ├── dashboard/         # Main dashboard
│   ├── login/             # Auth page
│   └── components/        # Shared components
├── db/
│   ├── schema.ts          # Drizzle schema
│   └── index.ts           # DB client
├── lib/
│   ├── auth.ts            # Auth helpers
│   ├── trpc.ts            # tRPC client
│   └── embeddings.ts      # RAG pipeline
├── server/
│   └── routers/           # tRPC routers
├── auth.ts                # NextAuth config
└── docker-compose.yml     # Local dev services
```

---

## Roadmap

- [ ] Stripe billing with usage-based plans
- [ ] CSV data analysis with charts
- [ ] More file types (Excel, Word)
- [ ] Public agent sharing via URL
- [ ] Rate limiting per plan
- [ ] Agent templates marketplace

---

## Built By

**Gaurav Kumar** — Full Stack Engineer
- 🌐 [Live Demo](https://agent-platform-production-6865.up.railway.app)
- 💼 [LinkedIn](https://linkedin.com/in/iamgaurav1993)
- 🐙 [GitHub](https://github.com/iamgaurav07)

---

## License

MIT