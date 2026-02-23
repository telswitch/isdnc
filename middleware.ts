/**
 * Next.js middleware for route protection.
 *
 * Uses next-auth/middleware to verify the JWT session token.
 * Unauthenticated requests to protected routes are redirected to /login.
 *
 * The `matcher` array uses string literals — Next.js statically analyzes
 * this at build time so dynamic values would be silently ignored.
 *
 * NEXTAUTH_SECRET must be set in the environment; the middleware reads
 * it automatically without needing to import authOptions.
 */
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/dnc-lookup", "/dnc-history"],
};
