import { describe, it, expect, mock, beforeEach } from "bun:test";
import { GetFolderTreeUseCase } from "../../application/folder/usecases/GetFolderTree";
import type { IFolderRepository } from "../../domain/folder/interfaces/IFolderRepository";
import type { FolderTreeNode } from "../../domain/folder/entities/Folder";
import { createMockRepository } from "../helpers/mockRepository";

describe("GetFolderTreeUseCase", () => {
  let useCase: GetFolderTreeUseCase;
  let mockRepository: IFolderRepository;

  const mockFolderTree: FolderTreeNode[] = [
    {
      id: 1,
      name: "Documents",
      parentId: null,
      isFolder: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      children: [
        {
          id: 2,
          name: "Work",
          parentId: 1,
          isFolder: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          children: [],
        },
      ],
    },
  ];

  beforeEach(() => {
    mockRepository = createMockRepository({
      getFolderTree: mock(() => Promise.resolve(mockFolderTree)),
    });
    useCase = new GetFolderTreeUseCase(mockRepository);
  });

  it("should return folder tree from repository", async () => {
    const result = await useCase.execute();
    expect(result).toEqual(mockFolderTree);
    expect(mockRepository.getFolderTree).toHaveBeenCalledTimes(1);
  });

  it("should return nested structure with children", async () => {
    const result = await useCase.execute();
    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(1);
  });

  it("should return empty array when no folders", async () => {
    mockRepository.getFolderTree = mock(() => Promise.resolve([]));
    const result = await useCase.execute();
    expect(result).toEqual([]);
  });
});
