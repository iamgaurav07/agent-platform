import Image from "next/image"
import Link from "next/link"
import { signOut } from "@/lib/auth"

export default function DashboardNav({
  userName,
  userImage,
}: {
  userName?: string | null
  userImage?: string | null
}) {
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

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {userImage && userName && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 10px 4px 4px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "50px" }}>
            <Image src={userImage} alt={userName} width={24} height={24} style={{ borderRadius: "50%" }} />
            <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)" }}>{userName}</span>
          </div>
        )}
        <form action={async () => {
          "use server"
          await signOut({ redirectTo: "/" })
        }}>
          <button type="submit" style={{
            fontSize: "13px", color: "var(--text-secondary)",
            background: "transparent", border: "1px solid var(--border)",
            padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "500",
          }}>
            Sign out
          </button>
        </form>
      </div>
    </nav>
  )
}