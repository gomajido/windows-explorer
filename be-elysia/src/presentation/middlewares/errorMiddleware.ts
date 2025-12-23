import { Elysia } from "elysia";

export const errorMiddleware = () => {
  return new Elysia({ name: "error-middleware" }).onError(
    ({ code, error, set }) => {
      const message = error instanceof Error ? error.message : "Unknown error";

      switch (code) {
        case "NOT_FOUND":
          set.status = 404;
          return {
            success: false,
            data: null,
            error: "Resource not found",
            code,
          };

        case "VALIDATION":
          set.status = 400;
          return {
            success: false,
            data: null,
            error: message,
            code,
          };

        case "PARSE":
          set.status = 400;
          return {
            success: false,
            data: null,
            error: "Invalid request body",
            code,
          };

        case "INTERNAL_SERVER_ERROR":
        default:
          set.status = 500;
          return {
            success: false,
            data: null,
            error: "Internal server error",
            code,
          };
      }
    }
  );
};
