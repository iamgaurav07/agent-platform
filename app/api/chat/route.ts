import { openai } from "@ai-sdk/openai"
import { streamText, tool } from "ai"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/db"
import { agents } from "@/db/schema"
import { eq } from "drizzle-orm"

export const maxDuration = 30

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = await req.json()
  const { messages, agentId } = body

  const agent = await db
    .select()
    .from(agents)
    .where(eq(agents.id, agentId))
    .limit(1)

  if (!agent[0]) {
    return new Response("Agent not found", { status: 404 })
  }

  const result = streamText({
    model: openai(agent[0].model),
    system: agent[0].systemPrompt,
    messages,
    maxSteps: 5,
    tools: {
      webSearch: tool({
        description: "Search the web for current information on any topic",
        inputSchema: z.object({
          query: z.string().describe("The search query"),
        }),
        execute: async ({ query }) => {
          return {
            results: `Search results for "${query}": This is a simulated result. In production this would call a real search API like Tavily.`,
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
            const result = Function(`"use strict"; return (${expression})`)()
            return { result: String(result) }
          } catch {
            return { error: "Invalid expression" }
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}