import { mock } from "bun:test";
import type { IFolderRepository } from "../../domain/folder/interfaces/IFolderRepository";
import type { Folder } from "../../domain/folder/entities/Folder";

export const createMockFolder = (overrides: Partial<Folder> = {}): Folder => ({
  id: 1,
  name: "Test Folder",
  parentId: null,
  isFolder: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

export const createMockRepository = (overrides: Partial<IFolderRepository> = {}): IFolderRepository => ({
  findAll: mock(() => Promise.resolve({ data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } })),
  findById: mock(() => Promise.resolve(null)),
  findByParentId: mock(() => Promise.resolve([])),
  getFolderTree: mock(() => Promise.resolve([])),
  search: mock(() => Promise.resolve([])),
  searchWithCursor: mock(() => Promise.resolve({ data: [], cursor: { next: null, hasMore: false } })),
  count: mock(() => Promise.resolve(0)),
  create: mock(() => Promise.resolve(createMockFolder())),
  update: mock(() => Promise.resolve(createMockFolder())),
  delete: mock(() => Promise.resolve()),
  hardDelete: mock(() => Promise.resolve()),
  restore: mock(() => Promise.resolve(createMockFolder())),
  ...overrides,
});
