import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const pool = mysql.createPool({
  host: Bun.env.DB_HOST || "127.0.0.1",
  port: Number(Bun.env.DB_PORT) || 3309,
  user: Bun.env.DB_USER || "root",
  password: Bun.env.DB_PASSWORD || "root",
  database: Bun.env.DB_NAME || "folder_explorer",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(pool, { schema, mode: "default" });

export type Database = typeof db;

export { pool };
