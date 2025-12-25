import { Elysia, t } from "elysia";
import { FolderRepository } from "../../../infrastructure/repositories/folder";
import { CachedFolderTreeRepository } from "../../../infrastructure/repositories/decorators";
import { cache } from "../../../infrastructure/cache";
import {
  GetFolderTreeUseCase,
  GetChildrenUseCase,
  GetChildrenWithCursorUseCase,
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

// Dependency injection with SOLID principles
// Base repository implements all interfaces
const folderRepository = new FolderRepository();

// Decorator pattern for caching (Open/Closed Principle)
const cachedTreeRepository = new CachedFolderTreeRepository(folderRepository, cache);

// Use cases depend on specific interfaces (Interface Segregation Principle)
const controller = new FolderController(
  new GetFolderTreeUseCase(cachedTreeRepository),        // Uses IFolderTreeRepository (cached)
  new GetChildrenUseCase(folderRepository),              // Uses IFolderReadRepository
  new GetChildrenWithCursorUseCase(folderRepository),    // Uses IFolderReadRepository (paginated)
  new GetFolderUseCase(folderRepository),                // Uses IFolderReadRepository
  new CreateFolderUseCase(folderRepository, folderRepository), // Uses IFolderReadRepository + IFolderWriteRepository
  new UpdateFolderUseCase(folderRepository),             // Uses IFolderWriteRepository
  new DeleteFolderUseCase(folderRepository),             // Uses IFolderDeleteRepository
  new SearchFoldersUseCase(folderRepository),            // Uses IFolderSearchRepository
  new SearchFoldersWithCursorUseCase(folderRepository)   // Uses IFolderSearchRepository
);

export const folderRoutes = new Elysia({ prefix: "/folders" })
  .use(authMiddleware())
  // Public routes
  .get("/tree", (ctx) => controller.getTree())
  .get("/search", (ctx) => controller.search(ctx), { query: FolderSchema.query.search })
  // Cursor-based search for scalable pagination
  .get("/search/cursor", (ctx) => controller.searchWithCursor(ctx), { query: FolderSchema.query.searchWithCursor })
  .get("/:id/children", (ctx) => controller.getChildren(ctx), { params: FolderSchema.params.id })
  .get("/:id/children/cursor", (ctx) => controller.getChildrenWithCursor(ctx), {
    params: FolderSchema.params.id,
    query: FolderSchema.query.cursorPagination,
  })
  .get("/:id", (ctx) => controller.getById(ctx), { params: FolderSchema.params.id })
  // Protected routes
  .post("/", (ctx) => controller.create(ctx), { body: FolderSchema.body.create })
  .patch("/:id", (ctx) => controller.update(ctx), { params: FolderSchema.params.id, body: FolderSchema.body.update })
  .delete("/:id", (ctx) => controller.delete(ctx), { params: FolderSchema.params.id });
