"use client";

/**
 * DNC History page (/dnc-history) — PROTECTED
 *
 * Allows an authenticated user to retrieve the full DNC registration
 * history for a given US phone number.
 *
 * Form:
 *  - Phone: (###) ###-#### input mask (PhoneInput component)
 *
 * On submit:
 *  1. Client-side validation
 *  2. POST /api/dnc-history with raw digits
 *  3. Display results in ResultsGrid
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import ResultsGrid from "@/components/ResultsGrid";
import type { ApiResponse, DncHistoryResult } from "@/types";

// Load masked input client-only to avoid SSR/hydration issues
const PhoneInput = dynamic(() => import("@/components/PhoneInput"), { ssr: false });

export default function DncHistoryPage() {
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState<DncHistoryResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  function validate(): boolean {
    const rawPhone = phone.replace(/\D/g, "");
    if (rawPhone.length !== 10) {
      setPhoneError("Please enter a complete 10-digit US phone number");
      return false;
    }
    setPhoneError("");
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResults(null);

    if (!validate()) return;

    const rawPhone = phone.replace(/\D/g, "");

    setLoading(true);
    try {
      const res = await fetch("/api/dnc-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: rawPhone }),
      });

      const data: ApiResponse<DncHistoryResult[]> = await res.json();

      if (!data.success) {
        setError(data.error ?? "History lookup failed. Please try again.");
        return;
      }

      setResults(data.data ?? []);
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">DNC History</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-2xl">
          {/* Instructions go here */}
          Enter a US phone number to retrieve its complete National Do Not Call
          registration history.
        </p>
      </div>

      {/* Form card */}
      <div className="page-card mb-8">
        {/* API/network error */}
        {error && (
          <div className="alert-error mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Phone input */}
          <div className="max-w-sm">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <PhoneInput
              id="phone"
              value={phone}
              onChange={(val) => {
                setPhone(val);
                if (phoneError) setPhoneError("");
              }}
              disabled={loading}
              className={`form-input ${phoneError ? "form-input-error" : ""}`}
            />
            {phoneError && (
              <p className="mt-1 text-xs text-red-600">{phoneError}</p>
            )}
          </div>

          <div className="flex items-center gap-4 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Searching…
                </span>
              ) : (
                "Submit"
              )}
            </button>

            {results !== null && !loading && (
              <button
                type="button"
                onClick={() => { setResults(null); setPhone(""); setError(""); }}
                className="btn-secondary"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results */}
      {results !== null && (
        <ResultsGrid
          data={results as Record<string, unknown>[]}
          title="History Results"
        />
      )}
    </div>
  );
}
