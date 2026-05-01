import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/db";
import { agents, runs, messages, toolCalls } from "@/db/schema"
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const agentsRouter = router({
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // first get all runs for this agent
      const agentRuns = await db
        .select()
        .from(runs)
        .where(eq(runs.agentId, input.id));

      // delete messages for each run
      for (const run of agentRuns) {
        await db.delete(messages).where(eq(messages.runId, run.id));
        await db.delete(toolCalls).where(eq(toolCalls.runId, run.id));
      }

      // delete runs
      await db.delete(runs).where(eq(runs.agentId, input.id));

      // now delete the agent
      await db.delete(agents).where(eq(agents.id, input.id));

      return { success: true };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        systemPrompt: z.string().min(1, "System prompt is required"),
        model: z.string().default("gpt-4o-mini"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
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
          .returning();
        return result[0];
      } catch (error: any) {
        console.error("Full error:", JSON.stringify(error, null, 2));
        console.error("Error message:", error.message);
        console.error("Error cause:", error.cause);
        throw error;
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        systemPrompt: z.string().min(1, "System prompt is required"),
        model: z.string(),
      }),
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
        .returning();
      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.delete(agents).where(eq(agents.id, input.id));
      return { success: true };
    }),
});
