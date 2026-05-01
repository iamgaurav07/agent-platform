"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import Link from "next/link";

export default function EditAgentPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const { data: agentList } = trpc.agents.getAll.useQuery();

  useEffect(() => {
    if (agentList && !loaded) {
      const agent = agentList.find((a) => a.id === agentId);
      if (agent) {
        setName(agent.name);
        setDescription(agent.description ?? "");
        setSystemPrompt(agent.systemPrompt);
        setModel(agent.model);
        setLoaded(true);
      }
    }
  }, [agentList, agentId, loaded]);

  const updateAgent = trpc.agents.update.useMutation({
    onSuccess: () => router.push("/dashboard"),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = () => {
    if (!name || !systemPrompt) {
      setError("Name and system prompt are required");
      return;
    }
    setError("");
    updateAgent.mutate({ id: agentId, name, description, systemPrompt, model });
  };

  if (!loaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav
        style={{
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              color: "var(--text-secondary)",
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: "8px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Dashboard
          </Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>
            Edit Agent
          </span>
        </div>
      </nav>

      <div
        style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 32px" }}
      >
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              letterSpacing: "-0.5px",
              marginBottom: "6px",
            }}
          >
            Edit Agent
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Update your agent&apos;s configuration
          </p>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "28px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {error && (
            <div
              style={{
                background: "var(--danger-light)",
                color: "var(--danger)",
                fontSize: "13px",
                padding: "12px 16px",
                borderRadius: "var(--radius)",
                marginBottom: "20px",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}

          {[
            {
              label: "Agent name",
              value: name,
              setter: setName,
              placeholder: "e.g. Research Assistant",
              type: "input",
            },
            {
              label: "Description",
              value: description,
              setter: setDescription,
              placeholder: "What does this agent do?",
              type: "input",
              optional: true,
            },
          ].map((field) => (
            <div key={field.label} style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "6px",
                }}
              >
                {field.label}
                {field.optional && (
                  <span
                    style={{
                      color: "var(--text-tertiary)",
                      fontWeight: "400",
                      marginLeft: "6px",
                    }}
                  >
                    (optional)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                placeholder={field.placeholder}
                style={{
                  width: "100%",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.15s",
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          ))}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--text-primary)",
                marginBottom: "6px",
              }}
            >
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "10px 14px",
                fontSize: "14px",
                outline: "none",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              <option value="gpt-4o">GPT-4o — Most capable</option>
              <option value="gpt-4o-mini">
                GPT-4o mini — Fast & efficient
              </option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo — Lightweight</option>
            </select>
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--text-primary)",
                marginBottom: "6px",
              }}
            >
              System Prompt
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant..."
              rows={6}
              style={{
                width: "100%",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "10px 14px",
                fontSize: "14px",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                lineHeight: "1.6",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-tertiary)",
                marginTop: "6px",
              }}
            >
              Defines how your agent behaves and what role it plays
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleSubmit}
              disabled={updateAgent.isPending}
              style={{
                flex: 1,
                background: updateAgent.isPending
                  ? "var(--text-tertiary)"
                  : "var(--accent)",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "var(--radius)",
                fontSize: "14px",
                fontWeight: "600",
                cursor: updateAgent.isPending ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
              }}
            >
              {updateAgent.isPending ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/dashboard"
              style={{
                padding: "12px 20px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: "14px",
                fontWeight: "500",
                color: "var(--text-secondary)",
                textDecoration: "none",
                textAlign: "center",
                transition: "all 0.15s",
              }}
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
