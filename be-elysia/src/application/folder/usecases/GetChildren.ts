import type { IFolderReadRepository } from "../../../domain/folder/interfaces/IFolderRepository";
import type { Folder } from "../../../domain/folder/entities/Folder";

export class GetChildrenUseCase {
  constructor(private folderRepository: IFolderReadRepository) {}

  async execute(parentId: number | null): Promise<Folder[]> {
    return this.folderRepository.findByParentId(parentId);
  }
}
