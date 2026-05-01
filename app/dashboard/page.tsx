import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { agents, runs } from "@/db/schema"
import { eq } from "drizzle-orm"
import Link from "next/link"
import AgentCard from "@/app/components/AgentCard"
import DashboardNav from "@/app/components/DashboardNav"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const userAgents = await db.select().from(agents).where(eq(agents.userId, session.user.id))
  const userRuns = await db.select().from(runs).where(eq(runs.userId, session.user.id))
  const totalTokens = userRuns.reduce((sum, run) => sum + (run.tokensUsed ?? 0), 0)
  const firstName = session.user?.name?.split(" ")[0]

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <DashboardNav
        userName={session.user?.name}
        userImage={session.user?.image}
      />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 32px" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.5px", color: "var(--text-primary)", marginBottom: "6px" }}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Manage your AI agents and track usage
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "40px" }}>
          {[
            { label: "Total Agents", value: userAgents.length, icon: "🤖", color: "#6366f1", bg: "#eef2ff" },
            { label: "Total Runs", value: userRuns.length, icon: "⚡", color: "#0ea5e9", bg: "#f0f9ff" },
            { label: "Tokens Used", value: totalTokens.toLocaleString(), icon: "📊", color: "#10b981", bg: "#f0fdf4" },
          ].map((stat, i) => (
            <div key={i} style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              boxShadow: "var(--shadow-sm)",
              transition: "box-shadow 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{
                  width: "40px", height: "40px",
                  background: stat.bg,
                  borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px",
                }}>
                  {stat.icon}
                </div>
              </div>
              <div style={{ fontSize: "30px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-1px", marginBottom: "4px" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Agents */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "2px" }}>
              Your Agents
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              {userAgents.length === 0 ? "No agents yet — create your first one" : `${userAgents.length} agent${userAgents.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link
            href="/agents/new"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "14px", fontWeight: "600",
              background: "var(--accent)",
              color: "white",
              padding: "10px 18px",
              borderRadius: "var(--radius)",
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
            New Agent
          </Link>
        </div>

        {userAgents.length === 0 ? (
          <div style={{
            background: "var(--bg-card)",
            border: "2px dashed var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "64px 32px",
            textAlign: "center",
          }}>
            <div style={{
              width: "64px", height: "64px",
              background: "var(--accent-light)",
              borderRadius: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px",
              margin: "0 auto 20px",
            }}>🤖</div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>Create your first agent</h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px", maxWidth: "360px", margin: "0 auto 24px" }}>
              Configure an AI agent with a custom system prompt and give it tools like web search
            </p>
            <Link
              href="/agents/new"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontSize: "14px", fontWeight: "600",
                background: "var(--accent)", color: "white",
                padding: "10px 20px", borderRadius: "var(--radius)",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
              }}
            >
              + Create Agent
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {userAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}