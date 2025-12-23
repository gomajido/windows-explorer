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
});
