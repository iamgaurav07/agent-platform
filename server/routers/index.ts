import { router } from "../trpc"
import { agentsRouter } from "./agents"
import { messagesRouter } from "./messages"

export const appRouter = router({
  agents: agentsRouter,
  messages: messagesRouter,
})

export type AppRouter = typeof appRouter