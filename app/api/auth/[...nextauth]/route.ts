import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email!))
          .limit(1)

        if (existing.length === 0) {
          await db.insert(users).values({
            id: user.id!,
            name: user.name,
            email: user.email!,
            image: user.image,
          })
        }
        return true
      } catch (error) {
        console.error("Error saving user:", error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
})

export const { GET, POST } = handlers