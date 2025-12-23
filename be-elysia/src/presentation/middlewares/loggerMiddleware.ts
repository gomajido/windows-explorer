import { Elysia } from "elysia";

export const loggerMiddleware = () => {
  return new Elysia({ name: "logger-middleware" })
    .onRequest(({ request }) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] → ${request.method} ${request.url}`);
    })
    .onAfterResponse(({ request, set }) => {
      const timestamp = new Date().toISOString();
      const status = set.status || 200;
      console.log(`[${timestamp}] ← ${request.method} ${request.url} ${status}`);
    })
    .onError(({ request, error }) => {
      const timestamp = new Date().toISOString();
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[${timestamp}] ✗ ${request.method} ${request.url} - ${message}`);
    });
};
