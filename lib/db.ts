/**
 * Microsoft SQL Server connection pool utility.
 *
 * Uses a module-level singleton in production, and a global-object
 * singleton in development to survive Next.js hot-module replacement
 * (HMR) without leaking connections.
 *
 * Configuration is read exclusively from environment variables:
 *   DB_SERVER, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD
 *
 * IMPORTANT: Server-side only. Never import in Client Components.
 */

import sql from "mssql";
import logger from "./logger";

// ============================================================
// Connection configuration
// ============================================================
function buildConfig(): sql.config {
  const server = process.env.DB_SERVER;
  const database = process.env.DB_DATABASE;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!server || !database || !user || !password) {
    throw new Error(
      "Missing required database environment variables. " +
        "Ensure DB_SERVER, DB_DATABASE, DB_USER, and DB_PASSWORD are set in .env.local"
    );
  }

  return {
    server,
    port: parseInt(process.env.DB_PORT || "1433", 10),
    database,
    user,
    password,
    options: {
      // Set encrypt: false for on-premises SQL Server 2019 without TLS.
      // Set to true for Azure SQL or if TLS is configured on the server.
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30_000,
    },
    connectionTimeout: 15_000,
    requestTimeout: 30_000,
  };
}

// ============================================================
// Singleton pool — survives HMR in development
// ============================================================
declare global {
  // eslint-disable-next-line no-var
  var _mssqlPool: sql.ConnectionPool | undefined;
}

// Module-level pool reference (used in production)
let _prodPool: sql.ConnectionPool | undefined;

/**
 * Returns the active connection pool, creating it on first call.
 * Safe to call on every request — it returns the existing pool if healthy.
 */
export async function getPool(): Promise<sql.ConnectionPool> {
  if (process.env.NODE_ENV === "development") {
    // In development, store on `global` so the pool survives HMR file reloads
    if (!global._mssqlPool || !global._mssqlPool.connected) {
      logger.info("Creating new MSSQL connection pool (development)");
      global._mssqlPool = await sql.connect(buildConfig());
      global._mssqlPool.on("error", (err) => {
        logger.error("MSSQL pool error", { err: err.message });
      });
    }
    return global._mssqlPool;
  }

  // Production: use a module-level singleton
  if (!_prodPool || !_prodPool.connected) {
    logger.info("Creating new MSSQL connection pool (production)");
    _prodPool = await sql.connect(buildConfig());
    _prodPool.on("error", (err) => {
      logger.error("MSSQL pool error", { err: err.message });
      _prodPool = undefined; // allow reconnect on next request
    });
  }
  return _prodPool;
}

// Re-export the sql namespace so callers can use sql.NVarChar, sql.Date, etc.
export { sql };
