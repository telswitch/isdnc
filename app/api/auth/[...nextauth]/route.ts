/**
 * NextAuth.js catch-all route handler.
 *
 * Thin wrapper — all configuration lives in lib/auth.ts so that
 * Server Components can import authOptions directly for getServerSession().
 */
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
