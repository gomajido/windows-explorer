import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { apiRoutes } from "./presentation/routes";

const PORT = process.env.PORT || 3001;

async function main() {
  const app = new Elysia()
    .use(cors())
    .use(apiRoutes)
    .get("/", () => ({
      message: "Folder Explorer API",
      version: "1.0.0",
      endpoints: {
        getFolderTree: "GET /api/v1/folders/tree",
        getChildren: "GET /api/v1/folders/:id/children",
        getFolder: "GET /api/v1/folders/:id",
        createFolder: "POST /api/v1/folders",
        updateFolder: "PATCH /api/v1/folders/:id",
        deleteFolder: "DELETE /api/v1/folders/:id",
      },
    }))
    .onError(({ code, error }) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error [${code}]:`, message);
      return {
        success: false,
        error: message,
        code,
      };
    })
    .listen(PORT);

  console.log(`🦊 Elysia server running at http://localhost:${PORT}`);
  console.log(`📂 Using MySQL database`);
}

main();
