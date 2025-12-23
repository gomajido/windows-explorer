import type { Context } from "elysia";
import type {
  GetFolderTreeUseCase,
  GetChildrenUseCase,
  GetFolderUseCase,
  CreateFolderUseCase,
  UpdateFolderUseCase,
  DeleteFolderUseCase,
  SearchFoldersUseCase,
  SearchFoldersWithCursorUseCase,
} from "../../application/folder/usecases";
import { ApiResponseHelper } from "../types";

interface CreateFolderBody {
  name: string;
  parentId?: number | null;
  isFolder?: boolean;
}

interface UpdateFolderBody {
  name: string;
}

export class FolderController {
  constructor(
    private getFolderTreeUseCase: GetFolderTreeUseCase,
    private getChildrenUseCase: GetChildrenUseCase,
    private getFolderUseCase: GetFolderUseCase,
    private createFolderUseCase: CreateFolderUseCase,
    private updateFolderUseCase: UpdateFolderUseCase,
    private deleteFolderUseCase: DeleteFolderUseCase,
    private searchFoldersUseCase: SearchFoldersUseCase,
    private searchFoldersWithCursorUseCase?: SearchFoldersWithCursorUseCase
  ) {}

  async getTree() {
    const data = await this.getFolderTreeUseCase.execute();
    return ApiResponseHelper.success(data, "Folder tree retrieved");
  }

  async search({ query }: Context<{ query: { q?: string } }>) {
    const data = await this.searchFoldersUseCase.execute(query.q || "");
    return ApiResponseHelper.success(data, "Search completed");
  }

  /**
   * Cursor-based search for scalable pagination.
   * Supports millions of records with O(1) pagination.
   */
  async searchWithCursor({ query }: Context<{ query: { q?: string; limit?: string; cursor?: string } }>) {
    if (!this.searchFoldersWithCursorUseCase) {
      return ApiResponseHelper.error("Cursor search not configured");
    }
    const data = await this.searchFoldersWithCursorUseCase.execute({
      query: query.q || "",
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      cursor: query.cursor,
    });
    return ApiResponseHelper.success(data, "Search completed");
  }

  async getChildren({ params }: Context<{ params: { id: string } }>) {
    const parentId = params.id === "root" ? null : parseInt(params.id);
    const data = await this.getChildrenUseCase.execute(parentId);
    return ApiResponseHelper.success(data, "Children retrieved");
  }

  async getById({ params, set }: Context<{ params: { id: string } }>) {
    const id = parseInt(params.id);
    const data = await this.getFolderUseCase.execute(id);
    if (!data) {
      set.status = 404;
      return ApiResponseHelper.notFound("Folder not found");
    }
    return ApiResponseHelper.success(data, "Folder retrieved");
  }

  async create({ body, set }: Context<{ body: CreateFolderBody }>) {
    const data = await this.createFolderUseCase.execute(
      body.name,
      body.parentId ?? null,
      body.isFolder ?? true
    );
    set.status = 201;
    return ApiResponseHelper.created(data, "Folder created");
  }

  async update({
    params,
    body,
    set,
  }: Context<{ params: { id: string }; body: UpdateFolderBody }>) {
    const id = parseInt(params.id);
    try {
      const data = await this.updateFolderUseCase.execute(id, body.name);
      return ApiResponseHelper.updated(data, "Folder updated");
    } catch (err) {
      set.status = 404;
      return ApiResponseHelper.notFound("Folder not found");
    }
  }

  async delete({ params }: Context<{ params: { id: string } }>) {
    const id = parseInt(params.id);
    await this.deleteFolderUseCase.execute(id);
    return ApiResponseHelper.deleted("Folder deleted");
  }
}
