import { createOpenAI } from "@ai-sdk/openai";
import { stepCountIs, streamText, tool } from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { agents, runs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { tavily } from "@tavily/core";
import { randomUUID } from "crypto";
import { searchKnowledgeBase } from "@/lib/embeddings";

export const maxDuration = 30;

const openaiClient = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { messages, agentId } = body;

  const agent = await db
    .select()
    .from(agents)
    .where(eq(agents.id, agentId))
    .limit(1);

  if (!agent[0]) {
    return new Response("Agent not found", { status: 404 });
  }

  const result = streamText({
    model: openaiClient(agent[0].model),
    system:
      agent[0].systemPrompt +
      `

STRICT RULES:
- You have searchKnowledge tool. Use it when asked about documents.
- After getting search results, write YOUR OWN summary. Max 5 sentences.
- NEVER copy or repeat the raw text from search results.
- If asked "what is this document" → one paragraph summary only.
- If asked for specific info → one direct answer only.
- Be brief. Professional. Concise.`,
    messages,
    stopWhen: stepCountIs(10),
    onFinish: async ({ usage }) => {
      try {
        await db.insert(runs).values({
          id: randomUUID(),
          agentId: agent[0].id,
          userId: session.user.id,
          status: "done",
          input: messages[messages.length - 1]?.content ?? "",
          tokensUsed: usage.totalTokens,
        });
        console.log("Run saved, tokens:", usage.totalTokens);
      } catch (error) {
        console.error("Error saving run:", error);
      }
    },
    tools: {
      webSearch: tool({
        description: "Search the web for current information on any topic",
        inputSchema: z.object({
          query: z.string().describe("The search query"),
        }),
        execute: async ({ query }) => {
          try {
            const client = tavily({ apiKey: process.env.TAVILY_API_KEY! });
            const response = await client.search(query, {
              maxResults: 3,
              searchDepth: "basic",
            });
            const results = response.results
              .map((r) => `**${r.title}**\n${r.content}\nSource: ${r.url}`)
              .join("\n\n");
            return { results };
          } catch {
            return { error: "Search failed. Please try again." };
          }
        },
      }),
      calculator: tool({
        description: "Perform mathematical calculations",
        inputSchema: z.object({
          expression: z.string().describe("Math expression to evaluate"),
        }),
        execute: async ({ expression }) => {
          try {
            const result = Function(`"use strict"; return (${expression})`)();
            return { result: String(result) };
          } catch {
            return { error: "Invalid expression" };
          }
        },
      }),
      searchKnowledge: tool({
        description:
          "Search uploaded documents and files in the knowledge base. Use this for ANY question about documents, CVs, resumes, data files, or uploaded content. Search with specific keywords for best results.",
        inputSchema: z.object({
          query: z
            .string()
            .describe(
              "Search query — use specific keywords from what you're looking for",
            ),
        }),
        execute: async ({ query }) => {
          try {
            const results = await searchKnowledgeBase({
              agentId: agent[0].id,
              query,
              limit: 3,
            });

            if (results.length === 0) {
              return { results: "No relevant content found." };
            }

            const context = results.map((r) => r.content).join(" ... ");

            return {
              results: `Here are relevant excerpts (summarize these in your own words, do not copy them):\n\n${context}`,
            };
          } catch (error) {
            return { error: "Search failed" };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
