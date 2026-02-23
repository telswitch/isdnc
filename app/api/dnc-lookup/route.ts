/**
 * POST /api/dnc-lookup
 *
 * Calls [dbo].[sp_dnc_lookup] with the provided phone number and date,
 * returning the result set as JSON.
 *
 * Request body: { phoneNumber: string, lookupDate: string }
 *   - phoneNumber: 10 raw digits (mask stripped by the client before sending)
 *   - lookupDate:  MM/DD/YYYY string
 *
 * Response: ApiResponse<DncLookupResult[]>
 *
 * Security:
 *  - Session is verified server-side (belt-and-suspenders alongside middleware.ts).
 *  - Phone numbers are masked in all log output (only last 4 digits visible).
 *  - Raw SQL errors are never sent to the client.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPool, sql } from "@/lib/db";
import logger from "@/lib/logger";
import type { ApiResponse, DncLookupResult } from "@/types";

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
    let body: { phoneNumber?: string; lookupDate?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { phoneNumber, lookupDate } = body;

    // ---- Validation ----
    const rawPhone = (phoneNumber ?? "").replace(/\D/g, "");
    if (rawPhone.length !== 10) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "A valid 10-digit US phone number is required" },
        { status: 400 }
      );
    }

    if (!lookupDate) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Lookup date is required" },
        { status: 400 }
      );
    }

    // Parse MM/DD/YYYY → JS Date for the sql.Date parameter
    const [month, day, year] = lookupDate.split("/");
    const parsedDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Lookup date must be in MM/DD/YYYY format" },
        { status: 400 }
      );
    }

    const maskedPhone = `***-***-${rawPhone.slice(-4)}`;
    logger.info(`POST /api/dnc-lookup — phone: ${maskedPhone}, date: ${lookupDate}`);

    // ---- Execute stored procedure ----
    const pool = await getPool();
    const result = await pool
      .request()
      .input("PhoneNumber", sql.NVarChar(20), rawPhone)
      .input("LookupDate", sql.Date, parsedDate)
      .execute<DncLookupResult>("dbo.sp_dnc_lookup");

    const rows = result.recordset;
    const elapsed = Date.now() - startTime;

    logger.info(
      `POST /api/dnc-lookup — phone: ${maskedPhone} — ${rows.length} row(s) returned (${elapsed}ms)`
    );

    return NextResponse.json<ApiResponse<DncLookupResult[]>>({
      success: true,
      data: rows,
    });
  } catch (err) {
    const elapsed = Date.now() - startTime;
    logger.error("POST /api/dnc-lookup — unhandled error", {
      err: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      elapsed,
    });

    return NextResponse.json<ApiResponse>(
      { success: false, error: "Lookup failed. Please try again." },
      { status: 500 }
    );
  }
}
