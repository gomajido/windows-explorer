import { Elysia } from "elysia";
import { db } from "../../infrastructure/database/connection";
import { sql } from "drizzle-orm";

interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: {
      status: "up" | "down";
      latencyMs?: number;
      error?: string;
    };
  };
}

const startTime = Date.now();

/**
 * Health check routes
 * Used by load balancers, monitoring systems, and orchestrators
 */
export const healthRoutes = new Elysia({ prefix: "/health" })
  /**
   * Basic liveness probe
   * Returns 200 if the service is running
   */
  .get("/live", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))

  /**
   * Readiness probe
   * Returns 200 if the service is ready to accept traffic
   */
  .get("/ready", async ({ set }) => {
    try {
      // Check database connection
      const start = Date.now();
      await db.execute(sql`SELECT 1`);
      const latency = Date.now() - start;

      return {
        status: "ready",
        timestamp: new Date().toISOString(),
        database: {
          status: "up",
          latencyMs: latency,
        },
      };
    } catch (error) {
      set.status = 503;
      return {
        status: "not_ready",
        timestamp: new Date().toISOString(),
        database: {
          status: "down",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  })

  /**
   * Detailed health check
   * Returns comprehensive system health information
   */
  .get("/", async ({ set }): Promise<HealthStatus> => {
    const checks: HealthStatus["checks"] = {
      database: {
        status: "up",
        latencyMs: 0,
      },
    };

    let overallStatus: "healthy" | "unhealthy" | "degraded" = "healthy";

    // Database health check
    try {
      const start = Date.now();
      await db.execute(sql`SELECT 1`);
      checks.database.latencyMs = Date.now() - start;

      // Warn if latency is high
      if (checks.database.latencyMs > 1000) {
        overallStatus = "degraded";
      }
    } catch (error) {
      checks.database.status = "down";
      checks.database.error = error instanceof Error ? error.message : "Unknown error";
      overallStatus = "unhealthy";
      set.status = 503;
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: process.env.npm_package_version ?? "1.0.0",
      checks,
    };
  });
