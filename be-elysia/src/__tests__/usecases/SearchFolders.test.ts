import { describe, it, expect, mock, beforeEach } from "bun:test";
import { SearchFoldersUseCase } from "../../application/folder/usecases/SearchFolders";
import type { IFolderRepository } from "../../domain/folder/interfaces/IFolderRepository";
import { createMockRepository, createMockFolder } from "../helpers/mockRepository";

describe("SearchFoldersUseCase", () => {
  let useCase: SearchFoldersUseCase;
  let mockRepository: IFolderRepository;

  beforeEach(() => {
    mockRepository = createMockRepository({
      search: mock(() => Promise.resolve([createMockFolder({ name: "Documents" })])),
    });
    useCase = new SearchFoldersUseCase(mockRepository);
  });

  it("should return search results", async () => {
    const result = await useCase.execute("doc");
    expect(result).toHaveLength(1);
    expect(mockRepository.search).toHaveBeenCalledWith("doc");
  });

  it("should return empty array for empty query", async () => {
    const result = await useCase.execute("");
    expect(result).toEqual([]);
  });

  it("should trim whitespace from query", async () => {
    await useCase.execute("  test  ");
    expect(mockRepository.search).toHaveBeenCalledWith("test");
  });

  it("should return empty array for whitespace-only query", async () => {
    const result = await useCase.execute("   ");
    expect(result).toEqual([]);
    expect(mockRepository.search).not.toHaveBeenCalled();
  });

  it("should handle special characters in query", async () => {
    await useCase.execute("test@#$%");
    expect(mockRepository.search).toHaveBeenCalledWith("test@#$%");
  });

  it("should handle case-sensitive search", async () => {
    await useCase.execute("Document");
    expect(mockRepository.search).toHaveBeenCalledWith("Document");
  });

  it("should handle very long query strings", async () => {
    const longQuery = "a".repeat(1000);
    await useCase.execute(longQuery);
    expect(mockRepository.search).toHaveBeenCalledWith(longQuery);
  });
});
