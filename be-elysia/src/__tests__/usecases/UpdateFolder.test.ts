import { describe, it, expect, mock, beforeEach } from "bun:test";
import { UpdateFolderUseCase } from "../../application/folder/usecases/UpdateFolder";
import type { IFolderRepository } from "../../domain/folder/interfaces/IFolderRepository";
import { ERROR_MESSAGES } from "../../domain/folder/constants";
import { createMockRepository, createMockFolder } from "../helpers/mockRepository";

describe("UpdateFolderUseCase", () => {
  let useCase: UpdateFolderUseCase;
  let mockRepository: IFolderRepository;

  beforeEach(() => {
    mockRepository = createMockRepository({
      update: mock(() => Promise.resolve(createMockFolder({ name: "Updated" }))),
    });
    useCase = new UpdateFolderUseCase(mockRepository);
  });

  it("should update folder with valid id and name", async () => {
    await useCase.execute(1, "Updated");
    expect(mockRepository.update).toHaveBeenCalledWith(1, "Updated");
  });

  it("should throw error for invalid id", async () => {
    await expect(useCase.execute(0, "Name")).rejects.toThrow(ERROR_MESSAGES.INVALID_ID);
  });

  it("should throw error for empty name", async () => {
    await expect(useCase.execute(1, "")).rejects.toThrow(ERROR_MESSAGES.INVALID_NAME);
  });

  it("should throw error for whitespace-only name", async () => {
    await expect(useCase.execute(1, "   ")).rejects.toThrow(ERROR_MESSAGES.INVALID_NAME);
  });

  it("should trim whitespace from name", async () => {
    await useCase.execute(1, "  Updated Name  ");
    expect(mockRepository.update).toHaveBeenCalledWith(1, "Updated Name");
  });

  it("should throw error for negative id", async () => {
    await expect(useCase.execute(-1, "Name")).rejects.toThrow(ERROR_MESSAGES.INVALID_ID);
  });

  it("should handle updating with special characters", async () => {
    await useCase.execute(1, "New@Name#123");
    expect(mockRepository.update).toHaveBeenCalledWith(1, "New@Name#123");
  });

  it("should handle updating with unicode characters", async () => {
    await useCase.execute(1, "新名称");
    expect(mockRepository.update).toHaveBeenCalledWith(1, "新名称");
  });

  it("should handle updating with very long name", async () => {
    const longName = "x".repeat(255);
    await useCase.execute(1, longName);
    expect(mockRepository.update).toHaveBeenCalledWith(1, longName);
  });

  it("should handle updating folder with large id", async () => {
    await useCase.execute(999999, "Updated");
    expect(mockRepository.update).toHaveBeenCalledWith(999999, "Updated");
  });
});
