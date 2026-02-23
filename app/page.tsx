/**
 * Landing page (/)
 *
 * Hero section with site title, description, and conditional CTAs:
 *  - Unauthenticated: Login + Register buttons
 *  - Authenticated: DNC Lookup + DNC History buttons
 */
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* ── Hero ── */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-block mb-6 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700 uppercase tracking-widest">
            National Do Not Call Registry
          </span>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Is this number on the{" "}
            <span className="text-blue-600">DNC list?</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto mb-10">
            Verify whether a US phone number has been registered on the
            National Do Not Call list for more than 30 days — and review its
             registration history for approximately the last 9 years.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link href="/dnc-lookup" className="btn-primary px-8 py-3 text-base">
                  DNC Lookup
                </Link>
                <Link
                  href="/dnc-history"
                  className="btn-secondary px-8 py-3 text-base"
                >
                  DNC History
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-primary px-8 py-3 text-base">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-secondary px-8 py-3 text-base"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="bg-white border-t border-gray-100 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Real-Time Lookup</h3>
            <p className="text-sm text-gray-500">
              Check any US phone number against the DNC registry instantly.
            </p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Registration History</h3>
            <p className="text-sm text-gray-500">
              View the complete DNC registration timeline for any number.
            </p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Secure Access</h3>
            <p className="text-sm text-gray-500">
              All lookups require authentication and are logged for auditing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
