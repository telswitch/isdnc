/**
 * NextAuth.js configuration (v4).
 *
 * Exported as `authOptions` so it can be shared between:
 *   - app/api/auth/[...nextauth]/route.ts  (the route handler)
 *   - Server Components that call getServerSession(authOptions)
 *
 * Strategy: JWT sessions (no database adapter required for session storage).
 * User credentials are validated against [dbo].[users] in SQL Server.
 */

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getPool, sql } from "./db";
import logger from "./logger";
import type { User } from "@/types";

export const authOptions: NextAuthOptions = {
  // Use JWT (stateless) sessions — no session table needed
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },

  // Custom pages
  pages: {
    signIn: "/login",
    error: "/login", // Redirect auth errors to the login page
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      /**
       * Validate credentials against the database.
       *
       * IMPORTANT: Return null (not throw) on auth failure.
       * Throwing causes a 500 response; returning null redirects to
       * the login page with ?error=CredentialsSignin.
       */
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          logger.warn("Login attempt with missing credentials");
          return null;
        }

        try {
          const pool = await getPool();
          const result = await pool
            .request()
            .input("username", sql.NVarChar(100), credentials.username.trim())
            .query<User>(
              `SELECT id, username, email, password_hash, is_active
               FROM [dbo].[users]
               WHERE username = @username`
            );

          const user = result.recordset[0];

          if (!user) {
            logger.warn(`Login failed: user not found — ${credentials.username}`);
            return null;
          }

          if (!user.is_active) {
            logger.warn(`Login failed: account inactive — ${credentials.username}`);
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );

          if (!passwordMatch) {
            logger.warn(`Login failed: wrong password — ${credentials.username}`);
            return null;
          }

          logger.info(`Login success — ${user.username}`);

          // Return the minimal object NextAuth needs to build the JWT
          return {
            id: String(user.id),
            name: user.username,
            email: user.email,
          };
        } catch (err) {
          logger.error("Database error during authentication", {
            err: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          });
          return null;
        }
      },
    }),
  ],

  callbacks: {
    /**
     * Persist the user id into the JWT token on sign-in.
     */
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },

    /**
     * Expose the user id on the client-facing session object.
     * Requires the module augmentation in types/index.ts.
     */
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
