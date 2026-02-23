/**
 * POST /api/dnc-history
 *
 * Calls [dbo].[sp_dnc_history] with the provided phone number,
 * returning the full registration history as JSON.
 *
 * Request body: { phoneNumber: string }
 *   - phoneNumber: 10 raw digits (mask stripped by the client before sending)
 *
 * Response: ApiResponse<DncHistoryResult[]>
 *
 * Security:
 *  - Session verified server-side (belt-and-suspenders alongside middleware.ts).
 *  - Phone numbers masked in all log output (only last 4 digits visible).
 *  - Raw SQL errors are never sent to the client.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool, sql } from "@/lib/db";
import logger from "@/lib/logger";
import type { ApiResponse, DncHistoryResult } from "@/types";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  // ---- Auth guard ----
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    let body: { phoneNumber?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { phoneNumber } = body;

    // ---- Validation ----
    const rawPhone = (phoneNumber ?? "").replace(/\D/g, "");
    if (rawPhone.length !== 10) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "A valid 10-digit US phone number is required" },
        { status: 400 }
      );
    }

    const maskedPhone = `***-***-${rawPhone.slice(-4)}`;
    logger.info(`POST /api/dnc-history — phone: ${maskedPhone}`);

    // ---- Execute stored procedure ----
    const pool = await getPool();
    const result = await pool
      .request()
      .input("PhoneNumber", sql.NVarChar(20), rawPhone)
      .execute<DncHistoryResult>("dbo.sp_dnc_history");

    const rows = result.recordset;
    const elapsed = Date.now() - startTime;

    logger.info(
      `POST /api/dnc-history — phone: ${maskedPhone} — ${rows.length} row(s) returned (${elapsed}ms)`
    );

    return NextResponse.json<ApiResponse<DncHistoryResult[]>>({
      success: true,
      data: rows,
    });
  } catch (err) {
    const elapsed = Date.now() - startTime;
    logger.error("POST /api/dnc-history — unhandled error", {
      err: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      elapsed,
    });

    return NextResponse.json<ApiResponse>(
      { success: false, error: "History lookup failed. Please try again." },
      { status: 500 }
    );
  }
}
