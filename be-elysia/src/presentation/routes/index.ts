import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { v1Routes } from "./v1";
import { healthRoutes } from "./healthRoutes";
import { loggerMiddleware, errorMiddleware, apiRateLimit } from "../middlewares";

export const apiRoutes = new Elysia({ prefix: "/api" })
  .use(swagger({
    documentation: {
      info: {
        title: "Folder Explorer API",
        version: "1.0.0",
        description: "Enterprise-grade folder management API",
      },
      tags: [
        { name: "folders", description: "Folder operations" },
        { name: "health", description: "Health check endpoints" },
      ],
    },
    path: "/docs",
  }))
  .use(loggerMiddleware())
  .use(errorMiddleware())
  .use(apiRateLimit)
  .use(healthRoutes)
  .use(v1Routes);
