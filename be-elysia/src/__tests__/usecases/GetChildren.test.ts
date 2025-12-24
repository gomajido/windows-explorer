import { describe, it, expect, beforeEach } from "bun:test";
import { GetChildrenUseCase } from "../../application/folder/usecases/GetChildren";
import type { IFolderRepository } from "../../domain/folder/interfaces/IFolderRepository";
import { createMockRepository, createMockFolder } from "../helpers/mockRepository";

describe("GetChildrenUseCase", () => {
  let useCase: GetChildrenUseCase;
  let mockRepository: IFolderRepository;

  beforeEach(() => {
    mockRepository = createMockRepository();
    useCase = new GetChildrenUseCase(mockRepository);
  });

  it("should return children for given parent id", async () => {
    const mockChildren = [
      createMockFolder({ id: 2, name: "Child 1", parentId: 1 }),
      createMockFolder({ id: 3, name: "Child 2", parentId: 1 }),
    ];
    mockRepository.findByParentId = () => Promise.resolve(mockChildren);

    const result = await useCase.execute(1);
    expect(result).toHaveLength(2);
    expect(result[0].parentId).toBe(1);
  });

  it("should return empty array for folder with no children", async () => {
    mockRepository.findByParentId = () => Promise.resolve([]);

    const result = await useCase.execute(999);
    expect(result).toEqual([]);
  });

  it("should return root folders when parentId is null", async () => {
    const mockRoots = [
      createMockFolder({ id: 1, name: "Documents", parentId: null }),
      createMockFolder({ id: 2, name: "Downloads", parentId: null }),
    ];
    mockRepository.findByParentId = () => Promise.resolve(mockRoots);

    const result = await useCase.execute(null);
    expect(result).toHaveLength(2);
    expect(result[0].parentId).toBeNull();
  });
});
