import type { IFolderReadRepository } from "../../../domain/folder/interfaces/IFolderRepository";
import type { Folder } from "../../../domain/folder/entities/Folder";

/**
 * Get only folder children for tree navigation (excludes files).
 * Used by folder tree components to show folder hierarchy.
 */
export class GetTreeChildrenUseCase {
  constructor(private folderRepository: IFolderReadRepository) {}

  async execute(parentId: number | null): Promise<Folder[]> {
    return this.folderRepository.findFoldersByParentId(parentId);
  }
}
