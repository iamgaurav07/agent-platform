import { z } from "zod"
import { router, protectedProcedure } from "../trpc"
import { db } from "@/db"
import { messages, runs } from "@/db/schema"
import { eq, asc, inArray } from "drizzle-orm"
import { randomUUID } from "crypto"

export const messagesRouter = router({
  getByAgent: protectedProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ ctx, input }) => {
      // get ALL runs for this agent
      const agentRuns = await db
        .select()
        .from(runs)
        .where(eq(runs.agentId, input.agentId))
        .orderBy(asc(runs.createdAt))

      if (!agentRuns.length) return []

      const runIds = agentRuns.map((r) => r.id)

      // get all messages for all runs
      const result = await db
        .select()
        .from(messages)
        .where(inArray(messages.runId, runIds))
        .orderBy(asc(messages.createdAt))

      return result
    }),

  save: protectedProcedure
    .input(z.object({
      runId: z.string(),
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = await db
        .insert(messages)
        .values({
          id: randomUUID(),
          runId: input.runId,
          role: input.role,
          content: input.content,
        })
        .returning()
      return result[0]
    }),

  createRun: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      input: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .insert(runs)
        .values({
          id: randomUUID(),
          agentId: input.agentId,
          userId: ctx.session.user.id,
          status: "running",
          input: input.input,
        })
        .returning()
      return result[0]
    }),
})