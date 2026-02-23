"use client";

/**
 * Global navigation bar.
 *
 * Behaviour:
 *  - Authenticated users: see DNC Lookup / DNC History links + Logout button
 *  - Unauthenticated users: see Login + Register buttons
 *  - Responsive: collapses to a hamburger menu on small screens
 */
import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthenticated = status === "authenticated" && !!session;

  const handleLogout = () => {
    setMenuOpen(false);
    signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-blue-700 hover:text-blue-800 transition-colors"
          >
            <span className="text-blue-600">DNC</span>
            <span className="text-gray-800">Checker</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden sm:flex items-center gap-6">
            {isAuthenticated && (
              <>
                <Link
                  href="/dnc-lookup"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  DNC Lookup
                </Link>
                <Link
                  href="/dnc-history"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  DNC History
                </Link>
              </>
            )}
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {status === "loading" ? (
              <div className="h-8 w-20 bg-gray-100 animate-pulse rounded-md" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {session.user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/dnc-lookup"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                DNC Lookup
              </Link>
              <Link
                href="/dnc-history"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                DNC History
              </Link>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">
                  Signed in as {session?.user?.name}
                </p>
                <button
                  onClick={handleLogout}
                  className="block py-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
