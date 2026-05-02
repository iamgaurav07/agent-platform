"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  const [myInput, setMyInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: agentList } = trpc.agents.getAll.useQuery();
  const agent = agentList?.find((a) => a.id === agentId);

  const { data: existingMessages } = trpc.messages.getByAgent.useQuery(
    { agentId },
    { enabled: !!agentId },
  );

  useEffect(() => {
    if (existingMessages && !loaded) {
      setLoaded(true);
      if (existingMessages.length > 0) {
        setMessages(
          existingMessages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        );
      }
    }
  }, [existingMessages, loaded]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createRun = trpc.messages.createRun.useMutation();
  const saveMessage = trpc.messages.save.useMutation();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myInput.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: myInput,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setMyInput("");
    setIsStreaming(true);

    let runId = currentRunId;
    if (!runId) {
      const run = await createRun.mutateAsync({ agentId, input: myInput });
      runId = run.id;
      setCurrentRunId(runId);
    }

    await saveMessage.mutateAsync({ runId, role: "user", content: myInput });

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error(await response.text());
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // keep the last incomplete line in buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          console.log("LINE:", trimmed); // debug

          if (!trimmed || trimmed === "data: [DONE]") continue;

          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));

              if (data.type === "text-delta" && data.delta) {
                assistantContent += data.delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + data.delta }
                      : m,
                  ),
                );
              }

              if (
                data.type === "tool-output-available" &&
                data.output &&
                !assistantContent
              ) {
                const output = data.output;
                const displayText = output.result
                  ? `The answer is **${output.result}**`
                  : output.results || output.error || JSON.stringify(output);
                assistantContent = displayText;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId && m.content === ""
                      ? { ...m, content: displayText }
                      : m,
                  ),
                );
              }

              if (
                data.type === "finish" &&
                data.finishReason === "tool-calls" &&
                !assistantContent
              ) {
                assistantContent = "Done.";
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId && m.content === ""
                      ? { ...m, content: "Done." }
                      : m,
                  ),
                );
              }
            } catch {
              // skip
            }
          }
        }
      }

      if (assistantContent && runId) {
        await saveMessage.mutateAsync({
          runId,
          role: "assistant",
          content: assistantContent,
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Something went wrong. Please try again." }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const initials = agent?.name?.slice(0, 1).toUpperCase() ?? "A";

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f8f9fa",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "#6b7280",
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontWeight: "500",
              transition: "all 0.15s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9 11L5 7l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </Link>

          <Link
            href={`/agents/${agentId}/knowledge`}
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              background: "none",
              border: "1px solid var(--border)",
              padding: "5px 12px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            📚 Knowledge
          </Link>

          <div
            style={{ width: "1px", height: "20px", background: "#e5e7eb" }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                color: "white",
                fontWeight: "700",
              }}
            >
              {initials}
            </div>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {agent?.name ?? "Agent"}
              </div>
              {agent?.description && (
                <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                  {agent.description}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: "500",
              background: "#f0fdf4",
              color: "#16a34a",
              padding: "4px 10px",
              borderRadius: "20px",
              border: "1px solid #bbf7d0",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#16a34a",
              }}
            />
            {agent?.model ?? "..."}
          </div>
          <button
            onClick={() => {
              if (confirm("Clear this conversation?")) {
                setMessages([]);
                setCurrentRunId(null);
              }
            }}
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              background: "none",
              border: "1px solid #e5e7eb",
              padding: "5px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Clear
          </button>
        </div>
      </nav>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 0" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px" }}>
          {messages.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "80px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  color: "white",
                  fontWeight: "700",
                  marginBottom: "20px",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                }}
              >
                {initials}
              </div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#111827",
                  marginBottom: "8px",
                  letterSpacing: "-0.3px",
                }}
              >
                {agent?.name ?? "Your agent"} is ready
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "#9ca3af",
                  maxWidth: "320px",
                  lineHeight: "1.6",
                  marginBottom: "32px",
                }}
              >
                Start a conversation. This agent can search the web and perform
                calculations.
              </p>

              {/* Suggested prompts */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  justifyContent: "center",
                }}
              >
                {[
                  "What's the latest news in AI?",
                  "Calculate 15% of 2,840",
                  "Search for TypeScript best practices",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setMyInput(prompt);
                      inputRef.current?.focus();
                    }}
                    style={{
                      fontSize: "13px",
                      color: "#6366f1",
                      background: "#eef2ff",
                      border: "1px solid #c7d2fe",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      cursor: "pointer",
                      fontWeight: "500",
                      transition: "all 0.15s",
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} style={{ marginBottom: "20px" }}>
              {/* User message */}
              {message.role === "user" && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      maxWidth: "68%",
                      padding: "10px 16px",
                      borderRadius: "18px 18px 4px 18px",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "white",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
                      wordBreak: "break-word",
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              )}

              {/* Assistant message */}
              {message.role === "assistant" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    gap: "10px",
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      flexShrink: 0,
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      color: "white",
                      fontWeight: "700",
                      marginTop: "2px",
                    }}
                  >
                    {initials}
                  </div>

                  {/* Bubble */}
                  <div
                    style={{
                      maxWidth: "72%",
                      padding: "12px 16px",
                      borderRadius: "4px 18px 18px 18px",
                      background: "white",
                      border: "1px solid #f0f0f0",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      fontSize: "14px",
                      lineHeight: "1.7",
                      color: "#111827",
                      wordBreak: "break-word",
                    }}
                  >
                    {message.content ? (
                      <ReactMarkdown
                        components={{
                          p: (props) => (
                            <p style={{ margin: "0 0 8px" }}>
                              {props.children}
                            </p>
                          ),
                          strong: (props) => (
                            <strong
                              style={{ fontWeight: "600", color: "#111827" }}
                            >
                              {props.children}
                            </strong>
                          ),
                          h1: (props) => (
                            <h1
                              style={{
                                fontSize: "17px",
                                fontWeight: "700",
                                margin: "14px 0 6px",
                                color: "#111827",
                                borderBottom: "1px solid #f0f0f0",
                                paddingBottom: "6px",
                              }}
                            >
                              {props.children}
                            </h1>
                          ),
                          h2: (props) => (
                            <h2
                              style={{
                                fontSize: "15px",
                                fontWeight: "600",
                                margin: "12px 0 6px",
                                color: "#111827",
                              }}
                            >
                              {props.children}
                            </h2>
                          ),
                          h3: (props) => (
                            <h3
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                margin: "10px 0 4px",
                                color: "#374151",
                              }}
                            >
                              {props.children}
                            </h3>
                          ),
                          ul: (props) => (
                            <ul
                              style={{
                                margin: "6px 0 8px",
                                paddingLeft: "18px",
                              }}
                            >
                              {props.children}
                            </ul>
                          ),
                          ol: (props) => (
                            <ol
                              style={{
                                margin: "6px 0 8px",
                                paddingLeft: "18px",
                              }}
                            >
                              {props.children}
                            </ol>
                          ),
                          li: (props) => (
                            <li style={{ margin: "4px 0", lineHeight: "1.6" }}>
                              {props.children}
                            </li>
                          ),
                          code: (props) => (
                            <code
                              style={{
                                background: "#f3f4f6",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontFamily: "monospace",
                                color: "#6366f1",
                              }}
                            >
                              {props.children}
                            </code>
                          ),
                          pre: (props) => (
                            <pre
                              style={{
                                background: "#f9fafb",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                padding: "12px",
                                overflowX: "auto",
                                fontSize: "12px",
                                margin: "8px 0",
                                fontFamily: "monospace",
                              }}
                            >
                              {props.children}
                            </pre>
                          ),
                          a: (props) => (
                            <a
                              href={props.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#6366f1",
                                textDecoration: "underline",
                                wordBreak: "break-all",
                              }}
                            >
                              {props.children}
                            </a>
                          ),
                          blockquote: (props) => (
                            <blockquote
                              style={{
                                borderLeft: "3px solid #6366f1",
                                paddingLeft: "12px",
                                margin: "8px 0",
                                color: "#6b7280",
                                fontStyle: "italic",
                              }}
                            >
                              {props.children}
                            </blockquote>
                          ),
                          hr: () => (
                            <hr
                              style={{
                                border: "none",
                                borderTop: "1px solid #f0f0f0",
                                margin: "12px 0",
                              }}
                            />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          alignItems: "center",
                          padding: "4px 0",
                        }}
                      >
                        {[0, 150, 300].map((delay) => (
                          <div
                            key={delay}
                            style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "50%",
                              background: "#d1d5db",
                              animation: `bounce 1.2s ${delay}ms infinite`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isStreaming &&
            messages[messages.length - 1]?.role !== "assistant" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "white",
                    fontWeight: "700",
                  }}
                >
                  {initials}
                </div>
                <div
                  style={{
                    background: "white",
                    border: "1px solid #f3f4f6",
                    padding: "12px 16px",
                    borderRadius: "18px 18px 18px 4px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      alignItems: "center",
                    }}
                  >
                    {[0, 150, 300].map((delay) => (
                      <div
                        key={delay}
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#d1d5db",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div
        style={{
          background: "white",
          borderTop: "1px solid #e5e7eb",
          padding: "16px 24px",
          flexShrink: 0,
        }}
      >
        <form
          onSubmit={handleSend}
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            display: "flex",
            gap: "10px",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              padding: "2px 4px 2px 16px",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = "#6366f1";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(99,102,241,0.1)";
              e.currentTarget.style.background = "white";
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "#f9fafb";
            }}
          >
            <input
              ref={inputRef}
              value={myInput}
              onChange={(e) => setMyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Message your agent..."
              disabled={isStreaming}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "14px",
                color: "#111827",
                padding: "10px 0",
                fontFamily: "inherit",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isStreaming || !myInput.trim()}
            style={{
              width: "42px",
              height: "42px",
              background:
                isStreaming || !myInput.trim()
                  ? "#e5e7eb"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              borderRadius: "12px",
              cursor:
                isStreaming || !myInput.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.15s",
              boxShadow:
                isStreaming || !myInput.trim()
                  ? "none"
                  : "0 2px 8px rgba(99,102,241,0.3)",
            }}
          >
            {isStreaming ? (
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #9ca3af",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M3 9h12M9 3l6 6-6 6"
                  stroke={myInput.trim() ? "white" : "#9ca3af"}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </form>
        <p
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: "#d1d5db",
            marginTop: "10px",
          }}
        >
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
