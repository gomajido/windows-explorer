import type { IFolderRepository } from "../../../domain/folder/interfaces/IFolderRepository";
import type { Folder } from "../../../domain/folder/entities/Folder";

export class GetFolderUseCase {
  constructor(private folderRepository: IFolderRepository) {}

  async execute(id: number): Promise<Folder | null> {
    return this.folderRepository.findById(id);
  }
}
