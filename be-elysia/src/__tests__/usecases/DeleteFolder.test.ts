import { describe, it, expect, beforeEach } from "bun:test";
import { DeleteFolderUseCase } from "../../application/folder/usecases/DeleteFolder";
import type { IFolderRepository } from "../../domain/folder/interfaces/IFolderRepository";
import { createMockRepository } from "../helpers/mockRepository";

describe("DeleteFolderUseCase", () => {
  let useCase: DeleteFolderUseCase;
  let mockRepository: IFolderRepository;

  beforeEach(() => {
    mockRepository = createMockRepository();
    useCase = new DeleteFolderUseCase(mockRepository);
  });

  it("should delete folder by id", async () => {
    await useCase.execute(1);
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
  });

  it("should call repository delete method", async () => {
    await useCase.execute(5);
    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });
});
