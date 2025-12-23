import { describe, it, expect, beforeEach } from "bun:test";
import { CreateFolderUseCase } from "../../application/folder/usecases/CreateFolder";
import type { IFolderRepository } from "../../domain/folder/interfaces/IFolderRepository";
import { ERROR_MESSAGES } from "../../domain/folder/constants";
import { createMockRepository } from "../helpers/mockRepository";

describe("CreateFolderUseCase", () => {
  let useCase: CreateFolderUseCase;
  let mockRepository: IFolderRepository;

  beforeEach(() => {
    mockRepository = createMockRepository();
    useCase = new CreateFolderUseCase(mockRepository);
  });

  it("should create folder with valid name", async () => {
    await useCase.execute("New Folder", 1, true);
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  it("should throw error for empty name", async () => {
    await expect(useCase.execute("", 1, true)).rejects.toThrow(ERROR_MESSAGES.INVALID_NAME);
  });

  it("should throw error for whitespace name", async () => {
    await expect(useCase.execute("   ", 1, true)).rejects.toThrow(ERROR_MESSAGES.INVALID_NAME);
  });

  it("should trim whitespace from name", async () => {
    await useCase.execute("  Test  ", 1, true);
    expect(mockRepository.create).toHaveBeenCalledWith("Test", 1, true);
  });
});
