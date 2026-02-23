/**
 * Root layout — wraps every page.
 *
 * Responsibilities:
 *  1. Sets the HTML <head> metadata (title, description, charset, viewport).
 *  2. Pre-fetches the NextAuth session server-side to avoid client flash.
 *  3. Wraps children in <SessionProviderWrapper> so all Client Components
 *     can call useSession() without an extra round-trip.
 *  4. Renders the <Navbar> on every page.
 */
import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "DNC Checker",
    template: "%s | DNC Checker",
  },
  description:
    "Verify whether a phone number is registered on the National Do Not Call list.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pre-fetch session on the server to prevent client-side loading flash
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        <SessionProviderWrapper session={session}>
          <Navbar />
          <main>{children}</main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
