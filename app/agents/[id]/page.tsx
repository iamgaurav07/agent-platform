"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  const [showThinking, setShowThinking] = useState(true);
  const [myInput, setMyInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: agentList } = trpc.agents.getAll.useQuery();
  const agent = agentList?.find((a) => a.id === agentId);

  // load existing messages from database
  const { data: existingMessages } = trpc.messages.getByAgent.useQuery(
    { agentId },
    { enabled: !!agentId },
  );

  const [loaded, setLoaded] = useState(false);

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

    // create a run in database
    let runId = currentRunId;
    if (!runId) {
      const run = await createRun.mutateAsync({
        agentId,
        input: myInput,
      });
      runId = run.id;
      setCurrentRunId(runId);
    }

    // save user message to database
    await saveMessage.mutateAsync({
      runId,
      role: "user",
      content: myInput,
    });

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

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "text-delta" && data.textDelta) {
                assistantContent += data.textDelta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + data.textDelta }
                      : m,
                  ),
                );
              }

              if (data.type === "tool-output-available" && data.output) {
                const output = data.output;
                let displayText = "";
                if (output.result) {
                  displayText = `The answer is **${output.result}**`;
                } else if (output.results) {
                  displayText = output.results;
                } else if (output.error) {
                  displayText = `Error: ${output.error}`;
                } else {
                  displayText = JSON.stringify(output);
                }
                if (!assistantContent) {
                  assistantContent = displayText;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId && m.content === ""
                        ? { ...m, content: displayText }
                        : m,
                    ),
                  );
                }
              }

              if (
                data.type === "finish" &&
                data.finishReason === "tool-calls"
              ) {
                if (!assistantContent) {
                  assistantContent = "Done.";
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId && m.content === ""
                        ? { ...m, content: "Done." }
                        : m,
                    ),
                  );
                }
              }
            } catch {
              // skip non-json lines
            }
          }
        }
      }

      // save assistant message to database
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
            ? {
                ...m,
                content: "Sorry, something went wrong. Please try again.",
              }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearChat = () => {
    if (confirm("Clear this conversation?")) {
      setMessages([]);
      setCurrentRunId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            ← Back
          </button>
          <div>
            <span className="text-base font-semibold">
              {agent?.name ?? "Agent"}
            </span>
            {agent?.description && (
              <p className="text-xs text-gray-400">{agent.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {agent?.model}
          </span>
          <button
            onClick={() => setShowThinking(!showThinking)}
            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showThinking ? "Hide thinking" : "Show thinking"}
          </button>
          <button
            onClick={handleClearChat}
            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-red-400 hover:text-red-500"
          >
            Clear chat
          </button>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              {agent?.name ?? "Your agent"} is ready
            </h2>
            <p className="text-sm text-gray-500">
              Start a conversation — your agent can search the web and do
              calculations
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="mb-6">
            {message.role === "user" && (
              <div className="flex justify-end">
                <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-lg text-sm leading-relaxed">
                  {message.content}
                </div>
              </div>
            )}

            {message.role === "assistant" && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm max-w-lg text-sm leading-relaxed text-gray-800 min-h-[20px]">
                  {message.content || (
                    <span className="text-gray-300">thinking...</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
            <div className="flex gap-1">
              <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            Agent is thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-gray-100 px-6 py-4">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3">
          <input
            value={myInput}
            onChange={(e) => setMyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as any);
              }
            }}
            placeholder="Message your agent..."
            disabled={isStreaming}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !myInput.trim()}
            className="bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isStreaming ? "Thinking..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
