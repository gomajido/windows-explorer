import type { IFolderRepository } from "../../../domain/folder/interfaces/IFolderRepository";

export class DeleteFolderUseCase {
  constructor(private readonly folderRepository: IFolderRepository) {}

  async execute(id: number): Promise<void> {
    return this.folderRepository.delete(id);
  }
}
