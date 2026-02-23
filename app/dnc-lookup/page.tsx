"use client";

/**
 * DNC Lookup page (/dnc-lookup) — PROTECTED
 *
 * Allows an authenticated user to look up a US phone number against the
 * National Do Not Call registry for a specific date.
 *
 * Form:
 *  - Phone: (###) ###-#### input mask (PhoneInput component)
 *  - Date:  MM/DD/YYYY input mask (DateInput component)
 *
 * On submit:
 *  1. Client-side validation
 *  2. POST /api/dnc-lookup with raw digits + date
 *  3. Display results in ResultsGrid
 *
 * SSR note: PhoneInput and DateInput use react-imask (browser APIs).
 * They are loaded with dynamic() and { ssr: false } to prevent hydration mismatches.
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import ResultsGrid from "@/components/ResultsGrid";
import type { ApiResponse, DncLookupResult } from "@/types";

// Load masked inputs client-only to avoid SSR/hydration issues
const PhoneInput = dynamic(() => import("@/components/PhoneInput"), { ssr: false });
const DateInput = dynamic(() => import("@/components/DateInput"), { ssr: false });

export default function DncLookupPage() {
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState<DncLookupResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [dateError, setDateError] = useState("");

  function validate(): boolean {
    let valid = true;

    const rawPhone = phone.replace(/\D/g, "");
    if (rawPhone.length !== 10) {
      setPhoneError("Please enter a complete 10-digit US phone number");
      valid = false;
    } else {
      setPhoneError("");
    }

    if (!date || date.replace(/\D/g, "").length < 8) {
      setDateError("Please enter a complete date (MM/DD/YYYY)");
      valid = false;
    } else {
      // Validate calendar date
      const [mm, dd, yyyy] = date.split("/");
      const parsed = new Date(`${yyyy}-${mm}-${dd}`);
      if (isNaN(parsed.getTime())) {
        setDateError("Please enter a valid date");
        valid = false;
      } else {
        setDateError("");
      }
    }

    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResults(null);

    if (!validate()) return;

    const rawPhone = phone.replace(/\D/g, "");

    setLoading(true);
    try {
      const res = await fetch("/api/dnc-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: rawPhone, lookupDate: date }),
      });

      const data: ApiResponse<DncLookupResult[]> = await res.json();

      if (!data.success) {
        setError(data.error ?? "Lookup failed. Please try again.");
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">DNC Lookup</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-2xl">
          {/* Instructions go here */}
          Enter a US phone number and a lookup date to check whether the number
          has been registered on the National Do Not Call list as of that date.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Phone input */}
            <div>
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

            {/* Date input */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Lookup Date
              </label>
              <DateInput
                id="date"
                value={date}
                onChange={(val) => {
                  setDate(val);
                  if (dateError) setDateError("");
                }}
                disabled={loading}
                className={`form-input ${dateError ? "form-input-error" : ""}`}
              />
              {dateError && (
                <p className="mt-1 text-xs text-red-600">{dateError}</p>
              )}
            </div>
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
                onClick={() => { setResults(null); setPhone(""); setDate(""); setError(""); }}
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
          title="Lookup Results"
        />
      )}
    </div>
  );
}
