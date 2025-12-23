import type { IFolderRepository } from "../../../domain/folder/interfaces/IFolderRepository";
import type { Folder } from "../../../domain/folder/entities/Folder";
import { ERROR_MESSAGES } from "../../../domain/folder/constants";

/**
 * Use case for creating a new folder or file.
 * Validates input before delegating to repository.
 */
export class CreateFolderUseCase {
  constructor(private readonly folderRepository: IFolderRepository) {}

  /**
   * Creates a new folder or file.
   * @param name - The name of the item (required, non-empty)
   * @param parentId - Parent folder ID, or null for root level
   * @param isFolder - True for folder, false for file
   * @returns The created folder entity
   * @throws Error if name is empty
   */
  async execute(name: string, parentId: number | null, isFolder: boolean = true): Promise<Folder> {
    if (!name || name.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.INVALID_NAME);
    }
    return this.folderRepository.create(name.trim(), parentId, isFolder);
  }
}
