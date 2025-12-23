import type { IFolderRepository } from "../../../domain/folder/interfaces/IFolderRepository";
import type { Folder } from "../../../domain/folder/entities/Folder";
import { ERROR_MESSAGES } from "../../../domain/folder/constants";

/**
 * Use case for updating a folder's name.
 * Validates input before delegating to repository.
 */
export class UpdateFolderUseCase {
  constructor(private readonly folderRepository: IFolderRepository) {}

  /**
   * Updates a folder's name.
   * @param id - The folder ID to update (must be positive)
   * @param name - The new name (required, non-empty)
   * @returns The updated folder entity
   * @throws Error if id is invalid or name is empty
   */
  async execute(id: number, name: string): Promise<Folder> {
    if (!id || id <= 0) {
      throw new Error(ERROR_MESSAGES.INVALID_ID);
    }
    if (!name || name.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.INVALID_NAME);
    }
    return this.folderRepository.update(id, name.trim());
  }
}
