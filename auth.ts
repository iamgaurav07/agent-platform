import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// @ts-expect-error next-auth v5 beta type issue
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
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
        if (!user.email) return false;

        // upsert — insert or update on conflict
        await db
          .insert(users)
          .values({
            id: user.id ?? crypto.randomUUID(),
            name: user.name,
            email: user.email,
            image: user.image,
          })
          .onConflictDoUpdate({
            target: users.email,
            set: {
              name: user.name,
              image: user.image,
            },
          });

        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return true;
      }
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token.sub) {
        // fetch the real user ID from DB using email
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email!))
          .limit(1);

        if (dbUser[0]) {
          session.user.id = dbUser[0].id;
        } else {
          session.user.id = token.sub;
        }
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
});
