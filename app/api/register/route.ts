/**
 * POST /api/register
 *
 * Creates a new user account in [dbo].[users].
 *
 * Request body: { username, email, password }
 * Response: ApiResponse<void>
 *
 * Security notes:
 *  - Passwords are hashed with bcrypt (cost factor 12) before storage.
 *  - Raw SQL error messages are never sent to the client.
 *  - SQL Server unique constraint violation codes (2627, 2601) are mapped
 *    to a 409 Conflict response with a safe message.
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPool, sql } from "@/lib/db";
import logger from "@/lib/logger";
import type { ApiResponse } from "@/types";

// Minimum security requirements
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    let body: { username?: string; email?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { username, email, password } = body;

    // ---- Server-side validation ----
    if (!username || !email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedUsername.length < MIN_USERNAME_LENGTH) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Username must be at least ${MIN_USERNAME_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    if (trimmedUsername.length > MAX_USERNAME_LENGTH) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Username is too long" },
        { status: 400 }
      );
    }

    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    // ---- Hash password ----
    const passwordHash = await bcrypt.hash(password, 12);

    // ---- Insert user ----
    const pool = await getPool();
    await pool
      .request()
      .input("username", sql.NVarChar(100), trimmedUsername)
      .input("email", sql.NVarChar(255), trimmedEmail)
      .input("password_hash", sql.NVarChar(255), passwordHash)
      .query(
        `INSERT INTO [dbo].[users] (username, email, password_hash)
         VALUES (@username, @email, @password_hash)`
      );

    const elapsed = Date.now() - startTime;
    logger.info(`POST /api/register — user created: ${trimmedUsername} (${elapsed}ms)`);

    return NextResponse.json<ApiResponse>({ success: true }, { status: 201 });
  } catch (err: unknown) {
    const elapsed = Date.now() - startTime;

    // SQL Server unique constraint violation: number 2627 or 2601
    const sqlErr = err as { number?: number };
    if (sqlErr?.number === 2627 || sqlErr?.number === 2601) {
      logger.warn(`POST /api/register — duplicate user (${elapsed}ms)`);
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Username or email already exists" },
        { status: 409 }
      );
    }

    logger.error("POST /api/register — unhandled error", {
      err: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      elapsed,
    });

    return NextResponse.json<ApiResponse>(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
