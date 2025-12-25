import type { IFolderDeleteRepository } from "../../../domain/folder/interfaces/IFolderRepository";

export class DeleteFolderUseCase {
  constructor(private readonly folderRepository: IFolderDeleteRepository) {}

  async execute(id: number): Promise<void> {
    return this.folderRepository.delete(id);
  }
}
