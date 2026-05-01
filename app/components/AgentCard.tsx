"use client"

import Link from "next/link"
import { trpc } from "@/lib/trpc"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Agent = {
  id: string
  name: string
  description: string | null
  systemPrompt: string
  model: string
}

export default function AgentCard({ agent }: { agent: Agent }) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const deleteAgent = trpc.agents.delete.useMutation({
    onSuccess: () => router.refresh(),
  })

  const modelColors: Record<string, { bg: string; color: string }> = {
    "gpt-4o": { bg: "#f0fdf4", color: "#16a34a" },
    "gpt-4o-mini": { bg: "#eff6ff", color: "#2563eb" },
    "gpt-3.5-turbo": { bg: "#fefce8", color: "#ca8a04" },
  }
  const modelStyle = modelColors[agent.model] ?? { bg: "#f5f5f5", color: "#737373" }

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${hovered ? "var(--border-hover)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        position: "relative",
        transition: "all 0.2s ease",
        boxShadow: hovered ? "var(--shadow)" : "var(--shadow-sm)",
        transform: hovered ? "translateY(-2px)" : "none",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{
          width: "44px", height: "44px",
          background: "var(--accent-light)",
          borderRadius: "12px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "20px",
        }}>
          🤖
        </div>
        <span style={{
          fontSize: "11px", fontWeight: "600",
          background: modelStyle.bg, color: modelStyle.color,
          padding: "3px 10px", borderRadius: "20px",
          letterSpacing: "0.3px",
        }}>
          {agent.model}
        </span>
      </div>

      {/* Content */}
      <h3 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "6px", letterSpacing: "-0.2px" }}>
        {agent.name}
      </h3>
      <p style={{
        fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6",
        overflow: "hidden", display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
        marginBottom: "18px",
      }}>
        {agent.description || agent.systemPrompt}
      </p>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
        <Link
          href={`/agents/${agent.id}`}
          style={{
            display: "flex", alignItems: "center", gap: "4px",
            fontSize: "13px", fontWeight: "600",
            color: "var(--accent)", textDecoration: "none",
            padding: "6px 12px",
            background: "var(--accent-light)",
            borderRadius: "8px",
            transition: "all 0.15s",
          }}
        >
          Open Chat
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        <div style={{ display: "flex", gap: "6px" }}>
          <Link
            href={`/agents/${agent.id}/edit`}
            style={{
              fontSize: "12px", fontWeight: "500",
              color: "var(--text-secondary)",
              padding: "6px 12px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "all 0.15s",
              background: "transparent",
            }}
          >
            Edit
          </Link>
          <button
            onClick={() => {
              if (confirm(`Delete "${agent.name}"?`)) {
                setDeleting(true)
                deleteAgent.mutate({ id: agent.id })
              }
            }}
            disabled={deleting}
            style={{
              fontSize: "12px", fontWeight: "500",
              color: deleting ? "var(--text-tertiary)" : "var(--danger)",
              padding: "6px 12px",
              border: `1px solid ${deleting ? "var(--border)" : "#fecaca"}`,
              borderRadius: "8px",
              background: deleting ? "transparent" : "var(--danger-light)",
              cursor: deleting ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {deleting ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}