import type { IFolderSearchRepository } from "../../../domain/folder/interfaces/IFolderRepository";
import type { Folder } from "../../../domain/folder/entities/Folder";

/**
 * Use case for searching folders and files by name.
 * Returns empty array for empty queries (graceful handling).
 */
export class SearchFoldersUseCase {
  constructor(private readonly folderRepository: IFolderSearchRepository) {}

  /**
   * Searches for folders and files matching the query.
   * @param query - The search term to match against names
   * @returns Array of matching folders/files, or empty array if query is empty
   */
  async execute(query: string): Promise<Folder[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.folderRepository.search(query.trim());
  }
}
