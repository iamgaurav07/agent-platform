import { z } from "zod"
import { router, protectedProcedure } from "../trpc"
import { db } from "@/db"
import { agents, runs, messages, toolCalls } from "@/db/schema"
import { eq } from "drizzle-orm"
import { randomUUID } from "crypto"

export const agentsRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select()
      .from(agents)
      .where(eq(agents.userId, ctx.session.user.id))
    return result
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        systemPrompt: z.string().min(1, "System prompt is required"),
        model: z.string().default("gpt-4o-mini"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .insert(agents)
        .values({
          id: randomUUID(),
          userId: ctx.session.user.id,
          name: input.name,
          description: input.description,
          systemPrompt: input.systemPrompt,
          model: input.model,
        })
        .returning()
      return result[0]
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        systemPrompt: z.string().min(1, "System prompt is required"),
        model: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .update(agents)
        .set({
          name: input.name,
          description: input.description,
          systemPrompt: input.systemPrompt,
          model: input.model,
          updatedAt: new Date(),
        })
        .where(eq(agents.id, input.id))
        .returning()
      return result[0]
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const agentRuns = await db
        .select()
        .from(runs)
        .where(eq(runs.agentId, input.id))

      for (const run of agentRuns) {
        await db.delete(messages).where(eq(messages.runId, run.id))
        await db.delete(toolCalls).where(eq(toolCalls.runId, run.id))
      }

      await db.delete(runs).where(eq(runs.agentId, input.id))
      await db.delete(agents).where(eq(agents.id, input.id))

      return { success: true }
    }),
})