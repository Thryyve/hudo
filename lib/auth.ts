import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  events: {
    async signIn(message) {
      console.log("[Auth.js signIn event]", JSON.stringify(message, null, 2))
    },
    async createUser(message) {
      console.log("[Auth.js createUser event]", JSON.stringify(message, null, 2))
    },
  },
  logger: {
    error(error) {
      console.error("[Auth.js Error]", JSON.stringify(error, null, 2))
    },
    warn(code) {
      console.warn("[Auth.js Warn]", code)
    },
    debug(code, metadata) {
      console.log("[Auth.js Debug]", code, JSON.stringify(metadata, null, 2))
    },
  },
  debug: true,
})
