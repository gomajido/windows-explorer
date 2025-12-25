import { Elysia, t } from "elysia";
import { FolderRepository } from "../../../infrastructure/repositories/folder";
import { 
  CachedFolderTreeRepository,
  CachedFolderReadRepository,
  CachedFolderSearchRepository,
} from "../../../infrastructure/repositories/decorators";
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
// Each decorator wraps specific repository interfaces
const cachedTreeRepository = new CachedFolderTreeRepository(folderRepository, cache);
const cachedReadRepository = new CachedFolderReadRepository(folderRepository, cache);
const cachedSearchRepository = new CachedFolderSearchRepository(folderRepository, cache);

// Use cases depend on specific interfaces (Interface Segregation Principle)
const controller = new FolderController(
  new GetFolderTreeUseCase(cachedTreeRepository),        // Uses IFolderTreeRepository (cached)
  new GetChildrenUseCase(cachedReadRepository),          // Uses IFolderReadRepository (cached)
  new GetChildrenWithCursorUseCase(cachedReadRepository), // Uses IFolderReadRepository (cached + paginated)
  new GetFolderUseCase(folderRepository),                // Uses IFolderReadRepository (not cached - low usage)
  new CreateFolderUseCase(folderRepository, folderRepository), // Uses IFolderReadRepository + IFolderWriteRepository
  new UpdateFolderUseCase(folderRepository),             // Uses IFolderWriteRepository
  new DeleteFolderUseCase(folderRepository),             // Uses IFolderDeleteRepository
  new SearchFoldersUseCase(cachedSearchRepository),      // Uses IFolderSearchRepository (cached)
  new SearchFoldersWithCursorUseCase(cachedSearchRepository) // Uses IFolderSearchRepository (cached + paginated)
);

export const folderRoutes = new Elysia({ prefix: "/folders" })
  .use(authMiddleware())
  // Add HTTP cache headers for GET requests
  .onAfterHandle(({ request, set }) => {
    if (request.method === 'GET') {
      // Cache GET requests for 60 seconds, allow stale for 5 minutes
      set.headers['Cache-Control'] = 'public, max-age=60, stale-while-revalidate=300';
    } else {
      // No cache for mutations
      set.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    }
  })
  // Public routes (READ - cached)
  .get("/tree", (ctx) => controller.getTree())
  .get("/search", (ctx) => controller.search(ctx), { query: FolderSchema.query.search })
  .get("/search/cursor", (ctx) => controller.searchWithCursor(ctx), { query: FolderSchema.query.searchWithCursor })
  // Dynamic routes last
  .get("/:id/children/cursor", (ctx) => controller.getChildrenWithCursor(ctx), {
    params: FolderSchema.params.id,
    query: FolderSchema.query.cursorPagination,
  })
  .get("/:id/children", (ctx) => controller.getChildren(ctx), { params: FolderSchema.params.id })
  .get("/:id", (ctx) => controller.getById(ctx), { params: FolderSchema.params.id })
  // Protected routes (WRITE - invalidate cache)
  .post("/", async (ctx) => {
    const result = await controller.create(ctx);
    // Invalidate all folder caches after create
    await cache.deletePattern("folder:*");
    return result;
  }, { body: FolderSchema.body.create })
  .patch("/:id", async (ctx) => {
    const result = await controller.update(ctx);
    // Invalidate all caches after update (name changed, affects search)
    await cache.deletePattern("folder:*");
    return result;
  }, { params: FolderSchema.params.id, body: FolderSchema.body.update })
  .delete("/:id", async (ctx) => {
    const result = await controller.delete(ctx);
    // Invalidate all caches after delete (structure changed)
    await cache.deletePattern("folder:*");
    return result;
  }, { params: FolderSchema.params.id });
