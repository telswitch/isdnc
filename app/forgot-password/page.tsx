"use client";

/**
 * Forgot Password page (/forgot-password)
 *
 * Accepts an email address and posts to POST /api/forgot-password.
 * The API always returns a success response (to prevent email enumeration),
 * so this page simply shows a confirmation message after submission.
 *
 * Actual email sending is stubbed server-side with a console.log and a TODO comment.
 */
import { useState } from "react";
import Link from "next/link";
import type { ApiResponse } from "@/types";

type PageState = "form" | "submitted" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>("form");
  const [serverError, setServerError] = useState("");

  function validate(): boolean {
    if (!email.trim()) {
      setEmailError("Email address is required");
      return false;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data: ApiResponse<{ message: string }> = await res.json();

      if (!data.success) {
        setServerError(data.error ?? "Request failed. Please try again.");
        setPageState("error");
        return;
      }

      setPageState("submitted");
    } catch {
      setServerError("A network error occurred. Please try again.");
      setPageState("error");
    } finally {
      setLoading(false);
    }
  }

  // ── Confirmation screen ──
  if (pageState === "submitted") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md page-card text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h1>
          <p className="text-sm text-gray-500 mb-6">
            If an account with <span className="font-medium text-gray-700">{email}</span> exists,
            you will receive a password reset link shortly.
          </p>
          <Link href="/login" className="btn-primary px-6 py-2 inline-block">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="page-card">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {/* Server error banner */}
          {serverError && (
            <div className="alert-error mb-6" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                disabled={loading}
                className={`form-input ${emailError ? "form-input-error" : ""}`}
                placeholder="you@example.com"
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-600">{emailError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Sending…
                </span>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
