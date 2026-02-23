/**
 * Application logger using Winston with daily log rotation.
 *
 * Features:
 *  - Console transport (always on, colorized in dev)
 *  - DailyRotateFile transport → logs/app-YYYY-MM-DD.log
 *  - Phone number masking: only last 4 digits visible in all log output
 *  - Unhandled exception and unhandled rejection handlers
 *
 * IMPORTANT: This module is server-side only.
 * Never import it in Client Components ("use client" files).
 */

import winston from "winston";
import "winston-daily-rotate-file"; // side-effect: registers DailyRotateFile transport
import path from "path";
import fs from "fs";

// Ensure the logs directory exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ============================================================
// Custom format: mask phone numbers in log messages.
// Matches 10-digit US numbers in various formats and replaces
// the first 6 digits, showing only the last 4.
// e.g. "2125551234" → "***-***-1234"
// e.g. "(212) 555-1234" → "***-***-1234"
// ============================================================
const maskPhoneNumbers = winston.format((info) => {
  const mask = (text: string): string =>
    text
      // Formatted: (NXX) NXX-XXXX
      .replace(/\(\d{3}\)\s*\d{3}-(\d{4})/g, "***-***-$1")
      // Dashes/dots/spaces: NXX-NXX-XXXX or NXX.NXX.XXXX
      .replace(/\d{3}[-.\s]\d{3}[-.\s](\d{4})/g, "***-***-$1")
      // Raw 10 digits (no separators)
      .replace(/\b\d{6}(\d{4})\b/g, "***-***-$1");

  if (typeof info.message === "string") {
    info.message = mask(info.message);
  }
  // Also mask in metadata fields if they are strings
  Object.keys(info).forEach((key) => {
    if (key !== "message" && typeof info[key] === "string") {
      (info as Record<string, unknown>)[key] = mask(info[key] as string);
    }
  });
  return info;
});

// ============================================================
// Transports
// ============================================================

const fileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "app-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d",
  format: winston.format.combine(
    maskPhoneNumbers(),
    winston.format.timestamp(),
    winston.format.json()
  ),
});

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    maskPhoneNumbers(),
    winston.format.colorize(),
    winston.format.timestamp({ format: "HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
      return `${timestamp} [${level}] ${message}${metaStr}`;
    })
  ),
});

// ============================================================
// Logger instance
// ============================================================
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: [consoleTransport, fileTransport],
  // Capture unhandled exceptions and rejections
  exceptionHandlers: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, "exceptions-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
    }),
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, "rejections-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
    }),
  ],
  exitOnError: false,
});

export default logger;
