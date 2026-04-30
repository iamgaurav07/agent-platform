import { z } from "zod"
import { router, protectedProcedure } from "../trpc"
import { db } from "@/db"
import { agents } from "@/db/schema"
import { eq } from "drizzle-orm"

export const agentsRouter = router({
  // Get all agents for the logged in user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select()
      .from(agents)
      .where(eq(agents.userId, ctx.session.user.id))
    return result
  }),

  // Create a new agent
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        systemPrompt: z.string().min(1, "System prompt is required"),
        model: z.string().default("gpt-4o"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .insert(agents)
        .values({
          userId: ctx.session.user.id,
          name: input.name,
          description: input.description,
          systemPrompt: input.systemPrompt,
          model: input.model,
        })
        .returning()
      return result[0]
    }),

  // Delete an agent
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(agents)
        .where(eq(agents.id, input.id))
      return { success: true }
    }),
})