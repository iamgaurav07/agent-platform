import { z } from "zod"
import { router, protectedProcedure } from "../trpc"
import { db } from "@/db"
import { messages, runs } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { randomUUID } from "crypto"

export const messagesRouter = router({
  // get all messages for an agent
  getByAgent: protectedProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ ctx, input }) => {
      // find the latest run for this agent
      const latestRun = await db
        .select()
        .from(runs)
        .where(eq(runs.agentId, input.agentId))
        .orderBy(runs.createdAt)
        .limit(1)

      if (!latestRun[0]) return []

      const result = await db
        .select()
        .from(messages)
        .where(eq(messages.runId, latestRun[0].id))
        .orderBy(asc(messages.createdAt))

      return result
    }),

  // save a message
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

  // create a new run and return its id
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