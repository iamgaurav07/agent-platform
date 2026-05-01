"use client"

import Link from "next/link"

const features = [
  {
    icon: "🧠",
    title: "ReAct agent loop",
    desc: "Agents reason step by step, pick the right tool, observe the result, and keep going until the job is done.",
  },
  {
    icon: "🔧",
    title: "Pluggable tools",
    desc: "Web search, code execution, and HTTP calls out of the box. Add your own tools with a simple schema.",
  },
  {
    icon: "💾",
    title: "Long-term memory",
    desc: "Agents remember past conversations using vector search — no more repeating yourself every session.",
  },
  {
    icon: "⚡",
    title: "Real-time streaming",
    desc: "Watch your agent think token by token. See every tool call and observation as it happens.",
  },
  {
    icon: "📊",
    title: "Run history",
    desc: "Every agent run is logged. See what worked, what didn't, and how much it cost.",
  },
  {
    icon: "🔒",
    title: "Auth built in",
    desc: "Sign in with Google or GitHub. Each user gets their own isolated agents and run history.",
  },
]

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>

      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: "60px",
        borderBottom: "1px solid #f0f0f0",
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px",
            boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
          }}>⚡</div>
          <span style={{ fontSize: "15px", fontWeight: "700", letterSpacing: "-0.3px", color: "#0a0a0a" }}>
            AgentFlow
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="#features" style={{ fontSize: "14px", color: "#525252", textDecoration: "none", padding: "8px 14px", borderRadius: "8px" }}>
            Features
          </Link>
          <Link
            href="/login"
            style={{
              fontSize: "14px", fontWeight: "600",
              background: "#0a0a0a", color: "white",
              padding: "8px 18px", borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center",
        padding: "100px 24px 80px",
        maxWidth: "760px", margin: "0 auto",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "#eef2ff", color: "#6366f1",
          fontSize: "12px", fontWeight: "600",
          padding: "5px 14px", borderRadius: "20px",
          marginBottom: "28px",
          letterSpacing: "0.3px",
        }}>
          <span>⚡</span> AI agents, built by you
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: "800",
          letterSpacing: "-2px",
          lineHeight: "1.05",
          color: "#0a0a0a",
          marginBottom: "24px",
        }}>
          Build and run AI agents<br />
          <span style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            that actually do things
          </span>
        </h1>

        <p style={{
          fontSize: "18px", color: "#525252",
          lineHeight: "1.7", marginBottom: "40px",
          maxWidth: "520px",
        }}>
          Create custom AI agents with tools like web search and code execution.
          Watch them think, act, and deliver results in real time.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/login"
            style={{
              fontSize: "15px", fontWeight: "600",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              padding: "14px 28px", borderRadius: "12px",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            }}
          >
            Start building free
          </Link>
          <Link
            href="#features"
            style={{
              fontSize: "15px", fontWeight: "600",
              background: "white", color: "#0a0a0a",
              padding: "14px 28px", borderRadius: "12px",
              textDecoration: "none",
              border: "1px solid #e5e5e5",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            See how it works
          </Link>
        </div>
      </section>

      {/* Social proof strip */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "32px",
        padding: "20px 48px",
        borderTop: "1px solid #f5f5f5",
        borderBottom: "1px solid #f5f5f5",
        background: "#fafafa",
        flexWrap: "wrap",
      }}>
        {["Next.js 15", "TypeScript", "OpenAI", "PostgreSQL", "tRPC", "Railway"].map((tech) => (
          <span key={tech} style={{ fontSize: "13px", color: "#a3a3a3", fontWeight: "500", letterSpacing: "0.3px" }}>
            {tech}
          </span>
        ))}
      </div>

      {/* Features */}
      <section id="features" style={{ padding: "96px 48px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "800", letterSpacing: "-1px", color: "#0a0a0a", marginBottom: "14px" }}>
            Everything your agent needs
          </h2>
          <p style={{ fontSize: "16px", color: "#525252", maxWidth: "440px", margin: "0 auto", lineHeight: "1.6" }}>
            Give your agents real tools, real memory, and real power.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
        }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: "16px",
                padding: "28px",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"
                e.currentTarget.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none"
                e.currentTarget.style.transform = "none"
              }}
            >
              <div style={{
                width: "44px", height: "44px",
                background: "#eef2ff",
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
                marginBottom: "16px",
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#0a0a0a", marginBottom: "8px" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "14px", color: "#737373", lineHeight: "1.6" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "96px 48px",
        textAlign: "center",
        background: "linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)",
        borderTop: "1px solid #e5e7ff",
      }}>
        <div style={{
          width: "56px", height: "56px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          borderRadius: "16px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "24px",
          margin: "0 auto 24px",
          boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
        }}>⚡</div>
        <h2 style={{ fontSize: "36px", fontWeight: "800", letterSpacing: "-1px", color: "#0a0a0a", marginBottom: "12px" }}>
          Ready to build your first agent?
        </h2>
        <p style={{ fontSize: "16px", color: "#525252", marginBottom: "36px" }}>
          No setup headaches. Just create, run, and ship.
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            fontSize: "15px", fontWeight: "600",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "white",
            padding: "14px 32px", borderRadius: "12px",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
          }}
        >
          Get started for free
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "24px 48px",
        borderTop: "1px solid #f0f0f0",
        textAlign: "center",
        fontSize: "13px", color: "#a3a3a3",
      }}>
        AgentFlow — built as a portfolio project by{" "}
        <a href="https://github.com/iamgaurav07" style={{ color: "#6366f1", textDecoration: "none" }}>
          @iamgaurav07
        </a>
      </footer>

    </div>
  )
}