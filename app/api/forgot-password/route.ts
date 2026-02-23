/**
 * POST /api/forgot-password
 *
 * Initiates a password reset flow for the given email address.
 *
 * Current implementation: stub only.
 *  - Validates the email input.
 *  - Looks up the account in the database.
 *  - Logs a TODO message instead of sending an email.
 *
 * Always returns a success response regardless of whether the email
 * exists — this prevents email enumeration attacks.
 *
 * TODO: Integrate an SMTP provider (e.g., SendGrid, Resend, Nodemailer)
 *       to send a real password-reset link.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";
import logger from "@/lib/logger";
import type { ApiResponse, User } from "@/types";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    let body: { email?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // ---- Look up account (server-side only, not exposed to client) ----
    try {
      const pool = await getPool();
      const result = await pool
        .request()
        .input("email", sql.NVarChar(255), email)
        .query<Pick<User, "id" | "username" | "email">>(
          `SELECT id, username, email
           FROM [dbo].[users]
           WHERE email = @email AND is_active = 1`
        );

      const user = result.recordset[0];

      if (user) {
        // TODO: Generate a signed password-reset token (e.g., JWT with short expiry)
        //       and send it to user.email via your SMTP provider.
        //
        // Example using Nodemailer:
        //   const token = generateResetToken(user.id);
        //   await sendResetEmail(user.email, token);
        //
        // For now, log the request so the flow can be verified end-to-end.
        console.log(
          `[TODO] Password reset requested for: ${user.email} (userId: ${user.id})`
        );
        logger.info(`Password reset requested for account: ${user.username}`);
      } else {
        // Account not found — still succeed silently to prevent enumeration
        logger.info("Password reset requested for unknown email (suppressed)");
      }
    } catch (dbErr) {
      // Log the DB error but still return success to the client
      logger.error("POST /api/forgot-password — DB error during user lookup", {
        err: dbErr instanceof Error ? dbErr.message : String(dbErr),
      });
    }

    const elapsed = Date.now() - startTime;
    logger.info(`POST /api/forgot-password — completed (${elapsed}ms)`);

    // Always return the same success message regardless of outcome
    return NextResponse.json<ApiResponse<{ message: string }>>({
      success: true,
      data: {
        message:
          "If an account with that email exists, you will receive a password reset link shortly.",
      },
    });
  } catch (err) {
    logger.error("POST /api/forgot-password — unhandled error", {
      err: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });

    return NextResponse.json<ApiResponse>(
      { success: false, error: "Request failed. Please try again." },
      { status: 500 }
    );
  }
}
