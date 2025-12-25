import type { IFolderReadRepository } from "../../../domain/folder/interfaces/IFolderRepository";
import type { CursorPaginatedResult, Folder } from "../../../domain/folder/entities/Folder";

/**
 * Use case for getting folder children with cursor-based pagination.
 * Scales efficiently to millions of children per folder.
 */
export class GetChildrenWithCursorUseCase {
  constructor(private folderRepository: IFolderReadRepository) {}

  async execute(
    parentId: number | null,
    options: { limit?: number; cursor?: string } = {}
  ): Promise<CursorPaginatedResult<Folder>> {
    return this.folderRepository.findByParentIdWithCursor(parentId, options);
  }
}
