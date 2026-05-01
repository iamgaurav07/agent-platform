import { redirect } from "next/navigation"
import { auth, signOut } from "@/lib/auth"
import { db } from "@/db"
import { agents, runs } from "@/db/schema"
import { eq } from "drizzle-orm"
import Image from "next/image"
import Link from "next/link"
import AgentCard from "@/app/components/AgentCard"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const userAgents = await db
    .select()
    .from(agents)
    .where(eq(agents.userId, session.user.id))

  const userRuns = await db
    .select()
    .from(runs)
    .where(eq(runs.userId, session.user.id))

  const totalTokens = userRuns.reduce(
    (sum, run) => sum + (run.tokensUsed ?? 0),
    0
  )

  const firstName = session.user?.name?.split(" ")[0]

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 50%, #faf8ff 100%)", fontFamily: "'Inter', sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
            <span style={{ fontSize: "16px" }}>⚡</span>
          </div>
          <span style={{ fontSize: "16px", fontWeight: "700", letterSpacing: "-0.5px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            AgentFlow
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", padding: "6px 12px 6px 6px", borderRadius: "50px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Image
              src={session.user?.image ?? ""}
              alt="avatar"
              width={28}
              height={28}
              style={{ borderRadius: "50%" }}
            />
            <span style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>{session.user?.name}</span>
          </div>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <button
              type="submit"
              style={{ fontSize: "13px", color: "#6b7280", background: "white", border: "1px solid rgba(0,0,0,0.08)", padding: "8px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: "500", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "700", letterSpacing: "-1px", color: "#111827", marginBottom: "8px" }}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={{ fontSize: "15px", color: "#9ca3af" }}>
            Here's what's happening with your agents today
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "40px" }}>
          {[
            {
              label: "Total agents",
              value: userAgents.length.toString(),
              icon: "🤖",
              color: "#6366f1",
              bg: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
              iconBg: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            },
            {
              label: "Total runs",
              value: userRuns.length.toString(),
              icon: "⚡",
              color: "#0ea5e9",
              bg: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
              iconBg: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
            },
            {
              label: "Tokens used",
              value: totalTokens.toLocaleString(),
              icon: "🔢",
              color: "#10b981",
              bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              iconBg: "linear-gradient(135deg, #10b981, #34d399)",
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{ background: stat.bg, borderRadius: "20px", padding: "28px", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div style={{ width: "44px", height: "44px", background: stat.iconBg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: `0 4px 12px ${stat.color}30` }}>
                  {stat.icon}
                </div>
              </div>
              <div style={{ fontSize: "36px", fontWeight: "700", color: "#111827", letterSpacing: "-1.5px", marginBottom: "4px" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Agents section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", marginBottom: "2px" }}>
              Your agents
            </h2>
            <p style={{ fontSize: "13px", color: "#9ca3af" }}>
              {userAgents.length === 0 ? "Create your first agent to get started" : `${userAgents.length} agent${userAgents.length !== 1 ? "s" : ""} ready to use`}
            </p>
          </div>
          <Link
            href="/agents/new"
            style={{ fontSize: "13px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", padding: "10px 20px", borderRadius: "12px", textDecoration: "none", fontWeight: "600", boxShadow: "0 4px 12px rgba(99,102,241,0.3)", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <span>+</span> New agent
          </Link>
        </div>

        {/* Empty state */}
        {userAgents.length === 0 ? (
          <div style={{ background: "white", border: "2px dashed #e5e7eb", borderRadius: "24px", padding: "80px 40px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, #eef2ff, #e0e7ff)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 24px" }}>
              🤖
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#111827", marginBottom: "8px" }}>
              No agents yet
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "15px", marginBottom: "28px", maxWidth: "340px", margin: "0 auto 28px" }}>
              Create your first AI agent and give it tools like web search and code execution
            </p>
            <Link
              href="/agents/new"
              style={{ fontSize: "14px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", padding: "12px 28px", borderRadius: "12px", textDecoration: "none", fontWeight: "600", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}
            >
              + Create your first agent
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