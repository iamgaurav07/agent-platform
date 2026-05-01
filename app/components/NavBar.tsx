"use client"

import Link from "next/link"
import Image from "next/image"
import { signOut } from "next-auth/react"

type NavbarProps = {
  userName?: string | null
  userImage?: string | null
  showBack?: boolean
  backHref?: string
  backLabel?: string
  title?: string
  actions?: React.ReactNode
}

export default function Navbar({
  userName,
  userImage,
  showBack,
  backHref = "/dashboard",
  backLabel = "Dashboard",
  title,
  actions,
}: NavbarProps) {
  return (
    <nav style={{
      background: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      padding: "0 32px",
      height: "56px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {showBack ? (
          <Link
            href={backHref}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              color: "var(--text-secondary)",
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: "8px",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-hover)"
              e.currentTarget.style.color = "var(--text-primary)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.color = "var(--text-secondary)"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {backLabel}
          </Link>
        ) : (
          <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "28px", height: "28px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
            }}>
              <span style={{ fontSize: "14px" }}>⚡</span>
            </div>
            <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
              AgentFlow
            </span>
          </Link>
        )}
        {title && (
          <>
            <span style={{ color: "var(--border)", fontSize: "18px" }}>/</span>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>{title}</span>
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {actions}
        {userName && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {userImage && (
              <Image
                src={userImage}
                alt={userName}
                width={28}
                height={28}
                style={{ borderRadius: "50%", border: "2px solid var(--border)" }}
              />
            )}
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>
              {userName}
            </span>
          </div>
        )}
        {userName && (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              background: "transparent",
              border: "1px solid var(--border)",
              padding: "6px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-hover)"
              e.currentTarget.style.background = "var(--bg-hover)"
              e.currentTarget.style.color = "var(--text-primary)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)"
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.color = "var(--text-secondary)"
            }}
          >
            Sign out
          </button>
        )}
      </div>
    </nav>
  )
}