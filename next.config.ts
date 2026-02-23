import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Prevent mssql, winston, and their native Node.js dependencies from being
   * bundled for the browser. Without this, the build fails because these
   * packages use Node.js native modules (net, tls, fs, crypto, etc.)
   */
  serverExternalPackages: ["mssql", "winston", "winston-daily-rotate-file"],
};

export default nextConfig;
