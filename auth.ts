// eslint-disable-next-line @typescript-eslint/no-require-imports
const NextAuth = require("next-auth").default
import GitHub from "next-auth/providers/github"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user }: { user: any }) {
      try {
        if (!user.email) return false
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1)

        if (existing.length === 0) {
          await db.insert(users).values({
            id: user.id ?? crypto.randomUUID(),
            name: user.name,
            email: user.email,
            image: user.image,
          })
        }
        return true
      } catch (error) {
        console.error("Error saving user:", error)
        return false
      }
    },
    async session({ session, token }: { session: any, token: any }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) token.sub = user.id
      return token
    },
  },
})