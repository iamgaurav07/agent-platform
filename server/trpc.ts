import { initTRPC, TRPCError } from "@trpc/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"

export const createContext = async () => {
  const session = await auth()
  return { session }
}

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure — throws error if not logged in
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  })
})