import type { IFolderSearchRepository } from "../../../domain/folder/interfaces/IFolderRepository";
import type { CursorPaginatedResult, SearchOptions } from "../../../domain/folder/entities/Folder";
import type { Folder } from "../../../domain/folder/entities/Folder";

/**
 * Use case for searching folders with cursor-based pagination.
 * Scales efficiently to millions of records.
 */
export class SearchFoldersWithCursorUseCase {
  constructor(private readonly folderRepository: IFolderSearchRepository) {}

  /**
   * Searches for folders with cursor-based pagination.
   * @param options - Search options including query, limit, and cursor
   * @returns Cursor-paginated results
   */
  async execute(options: SearchOptions): Promise<CursorPaginatedResult<Folder>> {
    if (!options.query || options.query.trim().length === 0) {
      return {
        data: [],
        cursor: { next: null, hasMore: false },
      };
    }
    return this.folderRepository.searchWithCursor({
      ...options,
      query: options.query.trim(),
    });
  }
}
