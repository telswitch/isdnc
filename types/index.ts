import type { DefaultSession } from "next-auth";

// ============================================================
// NextAuth session augmentation — adds user.id to the session
// ============================================================
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

// ============================================================
// Database entity types
// ============================================================

/**
 * Represents a row in the [dbo].[users] table.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  is_active: boolean;
}

// ============================================================
// Stored procedure result types
// ============================================================

/**
 * Represents a row returned by [dbo].[sp_dnc_lookup].
 * The index signature allows ResultsGrid to dynamically derive
 * columns from whatever columns the stored proc actually returns.
 */
export interface DncLookupResult {
  PhoneNumber?: string;
  LookupDate?: string;
  Status?: string;
  CheckedAt?: string;
  [key: string]: unknown;
}

/**
 * Represents a row returned by [dbo].[sp_dnc_history].
 */
export interface DncHistoryResult {
  PhoneNumber?: string;
  LookupDate?: string;
  Status?: string;
  [key: string]: unknown;
}

// ============================================================
// API response envelope
// ============================================================

/**
 * Standard JSON shape returned by all API routes.
 * { success: true, data: T }  — on success
 * { success: false, error: string } — on failure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================
// Form / UI types
// ============================================================

export interface DncLookupFormValues {
  phoneNumber: string;
  lookupDate: string;
}

export interface DncHistoryFormValues {
  phoneNumber: string;
}
