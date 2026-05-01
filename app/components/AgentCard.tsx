"use client"

import Link from "next/link"
import { trpc } from "@/lib/trpc"
import { useRouter } from "next/navigation"

type Agent = {
  id: string
  name: string
  description: string | null
  systemPrompt: string
  model: string
}

export default function AgentCard({ agent }: { agent: Agent }) {
  const router = useRouter()
  const deleteAgent = trpc.agents.delete.useMutation({
    onSuccess: () => router.refresh(),
  })

  return (
    <div
      style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "20px", padding: "24px", position: "relative", transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", cursor: "pointer" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.12)"
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"
        e.currentTarget.style.transform = "translateY(-2px)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)"
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      <Link href={`/agents/${agent.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #eef2ff, #e0e7ff)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
            🤖
          </div>
          <span style={{ fontSize: "11px", background: "#f9fafb", color: "#6b7280", padding: "4px 10px", borderRadius: "20px", border: "1px solid #f3f4f6", fontWeight: "500" }}>
            {agent.model}
          </span>
        </div>
        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827", letterSpacing: "-0.3px" }}>
          {agent.name}
        </h3>
        <p style={{ fontSize: "13px", color: "#9ca3af", lineHeight: "1.6", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
          {agent.description ?? agent.systemPrompt}
        </p>
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f9fafb" }}>
        <Link
          href={`/agents/${agent.id}`}
          style={{ fontSize: "13px", color: "#6366f1", textDecoration: "none", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}
        >
          Open chat
          <span style={{ fontSize: "16px", lineHeight: 1 }}>→</span>
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault()
            if (confirm("Delete this agent?")) {
              deleteAgent.mutate({ id: agent.id })
            }
          }}
          style={{ fontSize: "12px", color: "#d1d5db", background: "none", border: "none", cursor: "pointer", fontWeight: "500", padding: "4px 8px", borderRadius: "6px", transition: "all 0.15s" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ef4444"
            e.currentTarget.style.background = "#fef2f2"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#d1d5db"
            e.currentTarget.style.background = "none"
          }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}