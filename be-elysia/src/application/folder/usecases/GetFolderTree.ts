import type { IFolderRepository } from "../../../domain/folder/interfaces/IFolderRepository";
import type { FolderTreeNode } from "../../../domain/folder/entities/Folder";

export class GetFolderTreeUseCase {
  constructor(private folderRepository: IFolderRepository) {}

  async execute(): Promise<FolderTreeNode[]> {
    return this.folderRepository.getFolderTree();
  }
}
