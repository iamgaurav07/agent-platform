"use client"

import { useParams, useRouter } from "next/navigation"
import { trpc } from "@/lib/trpc"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

export default function KnowledgePage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [dragOver, setDragOver] = useState(false)

  const { data: agentList } = trpc.agents.getAll.useQuery()
  const agent = agentList?.find((a) => a.id === agentId)

  const fetchFiles = async () => {
    const res = await fetch(`/api/knowledge/list?agentId=${agentId}`)
    const data = await res.json()
    setFiles(data.files ?? [])
  }

  useEffect(() => {
    if (agentId) fetchFiles()
  }, [agentId])

  const handleUpload = async (file: File) => {
    if (!file) return

    const allowed = ["pdf", "txt", "md", "csv"]
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!ext || !allowed.includes(ext)) {
      setError("Only PDF, TXT, MD, and CSV files are supported")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB")
      return
    }

    setUploading(true)
    setError("")
    setSuccess("")
    setUploadProgress(`Processing ${file.name}...`)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("agentId", agentId)

      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err)
      }

      const data = await res.json()
      setSuccess(`Successfully uploaded "${file.name}" — ${data.chunks} chunks created`)
      fetchFiles()
    } catch (err: any) {
      setError(err.message ?? "Upload failed")
    } finally {
      setUploading(false)
      setUploadProgress("")
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Remove "${fileName}" from knowledge base?`)) return
    await fetch(`/api/knowledge/list?agentId=${agentId}&fileName=${encodeURIComponent(fileName)}`, {
      method: "DELETE",
    })
    fetchFiles()
  }

  const fileIcons: Record<string, string> = {
    pdf: "📄",
    csv: "📊",
    txt: "📝",
    md: "📝",
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", padding: "0 32px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none", padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--border)", fontWeight: "500" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>{agent?.name}</span>
          <span style={{ color: "var(--border)" }}>/</span>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-secondary)" }}>Knowledge Base</span>
        </div>
        <Link
          href={`/agents/${agentId}`}
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", background: "var(--accent)", color: "white", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", boxShadow: "0 2px 8px rgba(99,102,241,0.25)" }}
        >
          Open Chat →
        </Link>
      </nav>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 32px" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", letterSpacing: "-0.5px", marginBottom: "6px" }}>
            Knowledge Base
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            Upload documents so your agent can answer questions from your own data.
            Supports PDF, CSV, TXT and Markdown files.
          </p>
        </div>

        {/* Upload area */}
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files[0]
            if (file) handleUpload(file)
          }}
          style={{
            border: `2px dashed ${dragOver ? "var(--accent)" : uploading ? "var(--border)" : "var(--border-hover)"}`,
            borderRadius: "var(--radius-lg)",
            padding: "48px 32px",
            textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            background: dragOver ? "var(--accent-light)" : "var(--bg-card)",
            transition: "all 0.2s",
            marginBottom: "24px",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.csv"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
            }}
          />

          {uploading ? (
            <div>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
              <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--accent)", marginBottom: "4px" }}>
                {uploadProgress}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                Creating embeddings — this may take a moment
              </p>
              <div style={{ width: "120px", height: "3px", background: "var(--border)", borderRadius: "2px", margin: "16px auto 0", overflow: "hidden" }}>
                <div style={{ width: "40%", height: "100%", background: "var(--accent)", borderRadius: "2px", animation: "slide 1.5s infinite" }} />
              </div>
            </div>
          ) : (
            <div>
              <div style={{ width: "48px", height: "48px", background: "var(--accent-light)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", margin: "0 auto 16px" }}>
                📤
              </div>
              <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "6px" }}>
                {dragOver ? "Drop file here" : "Click to upload or drag & drop"}
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
                PDF, CSV, TXT, Markdown — max 10MB
              </p>
            </div>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ background: "var(--danger-light)", border: "1px solid #fecaca", color: "var(--danger)", fontSize: "13px", padding: "12px 16px", borderRadius: "var(--radius)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: "13px", padding: "12px 16px", borderRadius: "var(--radius)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>✅</span> {success}
          </div>
        )}

        {/* Files list */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
              Uploaded files
            </h2>
            <span style={{ fontSize: "12px", color: "var(--text-tertiary)", background: "var(--bg)", padding: "2px 10px", borderRadius: "20px", border: "1px solid var(--border)" }}>
              {files.length} file{files.length !== 1 ? "s" : ""}
            </span>
          </div>

          {files.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>
                No files uploaded yet — upload your first document above
              </p>
            </div>
          ) : (
            <div>
              {files.map((fileName, i) => {
                const ext = fileName.split(".").pop()?.toLowerCase() ?? "txt"
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 20px",
                      borderBottom: i < files.length - 1 ? "1px solid var(--border)" : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", background: "var(--accent-light)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                        {fileIcons[ext] ?? "📄"}
                      </div>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "2px" }}>
                          {fileName}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {ext} file
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(fileName)}
                      style={{ fontSize: "12px", color: "var(--danger)", background: "var(--danger-light)", border: "1px solid #fecaca", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}
                    >
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* How it works */}
        <div style={{ marginTop: "24px", background: "var(--accent-light)", border: "1px solid #c7d2fe", borderRadius: "var(--radius-lg)", padding: "20px 24px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "600", color: "var(--accent)", marginBottom: "10px" }}>
            💡 How it works
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              "Upload your documents — PDFs, CSVs, notes",
              "They get split into chunks and converted to embeddings",
              "When you chat, the agent automatically searches your documents",
              "Answers are grounded in your actual data",
            ].map((tip, i) => (
              <li key={i} style={{ fontSize: "13px", color: "#4338ca", padding: "3px 0", display: "flex", gap: "8px" }}>
                <span style={{ color: "var(--accent)", fontWeight: "600" }}>{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

      </div>

      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  )
}