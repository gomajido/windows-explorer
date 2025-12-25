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
    useCase = new CreateFolderUseCase(mockRepository, mockRepository);
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

  it("should create folder at root level (null parent)", async () => {
    await useCase.execute("Root Folder", null, true);
    expect(mockRepository.create).toHaveBeenCalledWith("Root Folder", null, true);
  });

  it("should create file (isFolder = false)", async () => {
    await useCase.execute("document.pdf", 1, false);
    expect(mockRepository.create).toHaveBeenCalledWith("document.pdf", 1, false);
  });

  it("should handle special characters in name", async () => {
    await useCase.execute("Test@#$%", 1, true);
    expect(mockRepository.create).toHaveBeenCalledWith("Test@#$%", 1, true);
  });

  it("should handle unicode characters in name", async () => {
    await useCase.execute("文件夹", 1, true);
    expect(mockRepository.create).toHaveBeenCalledWith("文件夹", 1, true);
  });

  it("should handle very long folder names", async () => {
    const longName = "a".repeat(255);
    await useCase.execute(longName, 1, true);
    expect(mockRepository.create).toHaveBeenCalledWith(longName, 1, true);
  });

  it("should create nested folder (deep hierarchy)", async () => {
    await useCase.execute("Deep Folder", 999, true);
    expect(mockRepository.create).toHaveBeenCalledWith("Deep Folder", 999, true);
  });
});
