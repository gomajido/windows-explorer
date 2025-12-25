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

  it("should handle deleting root folder", async () => {
    await useCase.execute(1);
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
  });

  it("should handle deleting nested folder", async () => {
    await useCase.execute(999);
    expect(mockRepository.delete).toHaveBeenCalledWith(999);
  });

  it("should handle deleting folder with children (cascade delete)", async () => {
    await useCase.execute(10);
    expect(mockRepository.delete).toHaveBeenCalledWith(10);
  });

  it("should handle zero as folder id", async () => {
    await useCase.execute(0);
    expect(mockRepository.delete).toHaveBeenCalledWith(0);
  });

  it("should handle negative folder id", async () => {
    await useCase.execute(-1);
    expect(mockRepository.delete).toHaveBeenCalledWith(-1);
  });
});
