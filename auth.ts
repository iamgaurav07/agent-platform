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
    async signIn({ user, account }: { user: any; account: any }) {
      console.log("SignIn called with user:", user);
      try {
        if (!user.email) return false;

        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);

        console.log("Existing user:", existing);

        if (existing.length === 0) {
          // use GitHub's numeric ID as string
          const userId = user.id ?? crypto.randomUUID();
          console.log("Inserting new user with id:", userId);
          await db.insert(users).values({
            id: userId,
            name: user.name,
            email: user.email,
            image: user.image,
          });
        }
        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return true;
      }
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      console.log("Session user id:", session.user.id);
      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
});
