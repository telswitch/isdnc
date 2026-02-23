"use client";

/**
 * Thin client-side wrapper for NextAuth's SessionProvider.
 *
 * NextAuth's <SessionProvider> is a Client Component (it uses React context),
 * so it cannot be used directly inside a Server Component layout.
 * This wrapper enables the Server Component layout to pass the pre-fetched
 * session down while keeping SessionProvider in the client bundle.
 */
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface SessionProviderWrapperProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function SessionProviderWrapper({
  children,
  session,
}: SessionProviderWrapperProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
