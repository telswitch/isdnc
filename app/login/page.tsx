"use client";

/**
 * Login page (/login)
 *
 * Authenticates the user via the NextAuth Credentials provider.
 * Uses signIn() with redirect: false so errors can be shown inline
 * without a full-page navigation.
 *
 * After successful login, calls router.refresh() to force Server Components
 * (layout, navbar) to re-render with the new session.
 */
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Show success banner when redirected from /register?registered=1
  const justRegistered = searchParams.get("registered") === "1";

  // Redirect already-authenticated users away from login
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dnc-lookup");
    }
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password,
        redirect: false, // Handle the redirect ourselves to show inline errors
      });

      if (result?.error) {
        setError("Invalid username or password. Please try again.");
      } else {
        // Force server components (layout/navbar) to re-render with new session
        router.push("/dnc-lookup");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="page-card">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter your credentials to access DNC Checker
            </p>
          </div>

          {/* Registration success banner */}
          {justRegistered && (
            <div className="alert-success mb-6">
              Account created successfully! You can now sign in.
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="alert-error mb-6" role="alert">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="form-input"
                placeholder="your_username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 space-y-2 text-center text-sm text-gray-500">
            <p>
              <Link
                href="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot your password?
              </Link>
            </p>
            <p>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
