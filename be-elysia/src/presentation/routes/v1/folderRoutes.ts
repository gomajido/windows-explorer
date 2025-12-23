import { Elysia, t } from "elysia";
import { FolderRepository } from "../../../infrastructure/repositories/folder";
import {
  GetFolderTreeUseCase,
  GetChildrenUseCase,
  GetFolderUseCase,
  CreateFolderUseCase,
  UpdateFolderUseCase,
  DeleteFolderUseCase,
  SearchFoldersUseCase,
  SearchFoldersWithCursorUseCase,
} from "../../../application/folder/usecases";
import { FolderSchema } from "../../../domain/folder/dto";
import { FolderController } from "../../controllers";
import { authMiddleware } from "../../middlewares";

// Dependency injection
const folderRepository = new FolderRepository();
const controller = new FolderController(
  new GetFolderTreeUseCase(folderRepository),
  new GetChildrenUseCase(folderRepository),
  new GetFolderUseCase(folderRepository),
  new CreateFolderUseCase(folderRepository),
  new UpdateFolderUseCase(folderRepository),
  new DeleteFolderUseCase(folderRepository),
  new SearchFoldersUseCase(folderRepository),
  new SearchFoldersWithCursorUseCase(folderRepository)
);

export const folderRoutes = new Elysia({ prefix: "/folders" })
  .use(authMiddleware())
  // Public routes
  .get("/tree", (ctx) => controller.getTree())
  .get("/search", (ctx) => controller.search(ctx), { query: FolderSchema.query.search })
  // Cursor-based search for scalable pagination
  .get("/search/cursor", (ctx) => controller.searchWithCursor(ctx), {
    query: t.Object({
      q: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      cursor: t.Optional(t.String()),
    }),
  })
  .get("/:id/children", (ctx) => controller.getChildren(ctx), { params: FolderSchema.params.id })
  .get("/:id", (ctx) => controller.getById(ctx), { params: FolderSchema.params.id })
  // Protected routes
  .post("/", (ctx) => controller.create(ctx), { body: FolderSchema.body.create })
  .patch("/:id", (ctx) => controller.update(ctx), { params: FolderSchema.params.id, body: FolderSchema.body.update })
  .delete("/:id", (ctx) => controller.delete(ctx), { params: FolderSchema.params.id });
