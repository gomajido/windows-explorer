import type { IFolderReadRepository } from "../../../domain/folder/interfaces/IFolderRepository";
import type { Folder } from "../../../domain/folder/entities/Folder";

export class GetFolderUseCase {
  constructor(private folderRepository: IFolderReadRepository) {}

  async execute(id: number): Promise<Folder | null> {
    return this.folderRepository.findById(id);
  }
}
