import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

/**
 * Master database connection (for writes)
 * In production, this would point to the master database
 * Currently points to same DB for development
 */
const masterPool = mysql.createPool({
  host: Bun.env.DB_WRITE_HOST || Bun.env.DB_HOST || "127.0.0.1",
  port: Number(Bun.env.DB_WRITE_PORT || Bun.env.DB_PORT) || 3309,
  user: Bun.env.DB_USER || "root",
  password: Bun.env.DB_PASSWORD || "root",
  database: Bun.env.DB_NAME || "folder_explorer",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Replica database connection (for reads)
 * In production, this would point to read replicas
 * Currently points to same DB for development
 */
const replicaPool = mysql.createPool({
  host: Bun.env.DB_READ_HOST || Bun.env.DB_HOST || "127.0.0.1",
  port: Number(Bun.env.DB_READ_PORT || Bun.env.DB_PORT) || 3309,
  user: Bun.env.DB_USER || "root",
  password: Bun.env.DB_PASSWORD || "root",
  database: Bun.env.DB_NAME || "folder_explorer",
  waitForConnections: true,
  connectionLimit: 20, // More connections for reads
  queueLimit: 0,
});

// Write database (master)
export const writeDb = drizzle(masterPool, { schema, mode: "default" });

// Read database (replica)
export const readDb = drizzle(replicaPool, { schema, mode: "default" });

// Default export for backward compatibility (uses write DB)
export const db = writeDb;

export type Database = typeof db;

export { masterPool as pool };
