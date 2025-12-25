import { eq, isNull, desc, like, inArray, and, sql, gt } from "drizzle-orm";
import { db as defaultDb, type Database, withTransaction } from "../../database/connection";
import { folders, type FolderRecord } from "../../database/schema";
import type { IFolderRepository } from "../../../domain/folder/interfaces/IFolderRepository";
import type { Folder, FolderTreeNode, PaginatedResult, FindAllOptions, CursorPaginatedResult, SearchOptions } from "../../../domain/folder/entities/Folder";
import { MAX_SEARCH_RESULTS } from "../../../domain/folder/constants";
import {
  FolderNotFoundException,
  FolderCreationFailedException,
  ParentNotFolderException,
  FolderNotDeletedException,
} from "../../../domain/folder/exceptions";
import { ENV } from "../../config";

/**
 * Enterprise-grade Repository implementation for folder operations.
 * 
 * Features:
 * - Constructor injection for testability
 * - Soft delete with restore capability
 * - Pagination support
 * - Transaction support for data integrity
 * - BFS batch delete for performance
 * - Query sanitization for security
 * - Comprehensive logging
 */
export class FolderRepository implements IFolderRepository {
  private readonly logger = {
    debug: (method: string, ...args: unknown[]) => {
      if (ENV.isDevelopment) {
        console.log(`[FolderRepo.${method}]`, ...args);
      }
    },
    error: (method: string, error: unknown) => {
      console.error(`[FolderRepo.${method}] Error:`, error);
    },
  };

  constructor(private readonly db: Database = defaultDb) {}

  /**
   * Maps a database record to a Folder domain entity.
   */
  private toFolder(record: FolderRecord): Folder {
    return {
      id: record.id,
      name: record.name,
      parentId: record.parentId,
      isFolder: record.isFolder,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    };
  }

  /**
   * Returns the base condition for excluding soft-deleted records.
   */
  private notDeleted() {
    return isNull(folders.deletedAt);
  }

  /**
   * Retrieves folders with pagination support.
   */
  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<Folder>> {
    const { page = 1, limit = 50, includeDeleted = false } = options;
    const offset = (page - 1) * limit;

    this.logger.debug("findAll", { page, limit, includeDeleted });

    const baseCondition = includeDeleted ? undefined : this.notDeleted();

    const [records, totalResult] = await Promise.all([
      this.db
        .select()
        .from(folders)
        .where(baseCondition)
        .orderBy(desc(folders.isFolder), folders.name)
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(folders)
        .where(baseCondition),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return {
      data: records.map((r) => this.toFolder(r)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Finds a folder by its unique identifier.
   */
  async findById(id: number, includeDeleted = false): Promise<Folder | null> {
    this.logger.debug("findById", { id, includeDeleted });

    const conditions = includeDeleted
      ? eq(folders.id, id)
      : and(eq(folders.id, id), this.notDeleted());

    const records = await this.db
      .select()
      .from(folders)
      .where(conditions)
      .limit(1);

    return records.length > 0 ? this.toFolder(records[0]) : null;
  }

  /**
   * Finds all direct children of a parent folder (excludes soft-deleted).
   * Legacy method - loads all children. Use findByParentIdWithCursor for large datasets.
   */
  async findByParentId(parentId: number | null): Promise<Folder[]> {
    this.logger.debug("findByParentId", { parentId });

    const parentCondition = parentId === null
      ? isNull(folders.parentId)
      : eq(folders.parentId, parentId);

    const records = await this.db
      .select()
      .from(folders)
      .where(and(parentCondition, this.notDeleted()))
      .orderBy(desc(folders.isFolder), folders.name);

    return records.map((r) => this.toFolder(r));
  }

  /**
   * Finds only folder children (excludes files) for tree navigation.
   * Used by tree components to show folder hierarchy only.
   */
  async findFoldersByParentId(parentId: number | null): Promise<Folder[]> {
    this.logger.debug("findFoldersByParentId", { parentId });

    const parentCondition = parentId === null
      ? isNull(folders.parentId)
      : eq(folders.parentId, parentId);

    const records = await this.db
      .select()
      .from(folders)
      .where(and(
        parentCondition,
        eq(folders.isFolder, true),  // Only folders for tree
        this.notDeleted()
      ))
      .orderBy(folders.name);

    return records.map((r) => this.toFolder(r));
  }

  /**
   * Finds children with cursor-based pagination for scalability.
   * Uses ID-based cursor for O(1) pagination at any position.
   */
  async findByParentIdWithCursor(
    parentId: number | null,
    options: { limit?: number; cursor?: string } = {}
  ): Promise<CursorPaginatedResult<Folder>> {
    const { limit = 50, cursor } = options;
    this.logger.debug("findByParentIdWithCursor", { parentId, limit, cursor });

    const parentCondition = parentId === null
      ? isNull(folders.parentId)
      : eq(folders.parentId, parentId);

    // Decode cursor (base64 encoded last ID)
    let lastId: number | null = null;
    if (cursor) {
      try {
        lastId = parseInt(Buffer.from(cursor, "base64").toString("utf-8"), 10);
      } catch {
        lastId = null;
      }
    }

    // Build query with cursor condition
    const baseConditions = [parentCondition, this.notDeleted()];
    if (lastId !== null) {
      baseConditions.push(gt(folders.id, lastId));
    }

    // Fetch limit + 1 to check if there are more results
    const records = await this.db
      .select()
      .from(folders)
      .where(and(...baseConditions))
      .orderBy(desc(folders.isFolder), folders.name, folders.id)
      .limit(limit + 1);

    const hasMore = records.length > limit;
    const data = records.slice(0, limit).map((r) => this.toFolder(r));

    // Encode next cursor
    const nextCursor = hasMore && data.length > 0
      ? Buffer.from(String(data[data.length - 1].id)).toString("base64")
      : null;

    return {
      data,
      cursor: {
        next: nextCursor,
        hasMore,
      },
    };
  }

  /**
   * ⭐ OPTIMIZED for scale: Load only root folders (lazy loading)
   * For millions of records, this loads ~100 roots instead of entire tree
   * Children are loaded on-demand when folders are expanded
   */
  async getFolderTree(): Promise<FolderTreeNode[]> {
    this.logger.debug("getFolderTree - loading root folders only (lazy)");
    
    // Load only root folders with pagination
    const rootFolders = await this.db
      .select()
      .from(folders)
      .where(and(
        eq(folders.isFolder, true),
        isNull(folders.parentId),
        this.notDeleted()
      ))
      .orderBy(folders.name)
      .limit(100); // Limit roots for initial load

    // Check if each root has children (avoid N+1 queries)
    const rootIds = rootFolders.map(f => f.id);
    const childCounts = await this.getChildCounts(rootIds);

    return rootFolders.map(record => ({
      ...this.toFolder(record),
      children: [],
      hasChildren: (childCounts.get(record.id) || 0) > 0,
    }));
  }

  /**
   * Check if folders have children (efficient batch query)
   * Returns Map of folderId -> child count
   */
  private async getChildCounts(parentIds: number[]): Promise<Map<number, number>> {
    if (parentIds.length === 0) return new Map();

    const counts = await this.db
      .select({
        parentId: folders.parentId,
        count: sql<number>`count(*)`,
      })
      .from(folders)
      .where(and(
        inArray(folders.parentId, parentIds),
        eq(folders.isFolder, true),
        this.notDeleted()
      ))
      .groupBy(folders.parentId);

    return new Map(counts.map(c => [c.parentId!, Number(c.count)]));
  }

  /**
   * Legacy method: Builds complete tree (USE ONLY FOR SMALL DATASETS)
   * For production with millions of records, use getFolderTree() + lazy loading
   */
  async getFullFolderTree(): Promise<FolderTreeNode[]> {
    this.logger.debug("getFullFolderTree - WARNING: Loading entire tree");

    const allFolders = await this.db
      .select()
      .from(folders)
      .where(and(eq(folders.isFolder, true), this.notDeleted()))
      .orderBy(folders.name);

    const folderMap = new Map<number, FolderTreeNode>();
    const rootFolders: FolderTreeNode[] = [];

    for (const record of allFolders) {
      folderMap.set(record.id, {
        ...this.toFolder(record),
        children: [],
      });
    }

    for (const record of allFolders) {
      const node = folderMap.get(record.id)!;
      if (record.parentId === null) {
        rootFolders.push(node);
      } else {
        const parent = folderMap.get(record.parentId);
        if (parent) {
          parent.children.push(node);
        }
      }
    }

    return rootFolders;
  }

  /**
   * Searches for folders and files by name using LIKE pattern matching.
   * Sanitizes input to prevent SQL injection via wildcards.
   */
  async search(query: string, limit = MAX_SEARCH_RESULTS): Promise<Folder[]> {
    this.logger.debug("search", { query, limit });

    const sanitizedQuery = query.replace(/[%_]/g, "\\$&");
    const records = await this.db
      .select()
      .from(folders)
      .where(and(like(folders.name, `%${sanitizedQuery}%`), this.notDeleted()))
      .orderBy(desc(folders.isFolder), folders.name)
      .limit(limit);

    return records.map((r) => this.toFolder(r));
  }

  /**
   * Cursor-based search for scalable pagination.
   * Uses ID-based cursor instead of offset for O(1) pagination at any position.
   * 
   * Why cursor > offset:
   * - Offset: SELECT ... OFFSET 10000 → scans 10000 rows first (slow)
   * - Cursor: SELECT ... WHERE id > 10000 → uses index (fast)
   */
  async searchWithCursor(options: SearchOptions): Promise<CursorPaginatedResult<Folder>> {
    const { query, limit = MAX_SEARCH_RESULTS, cursor } = options;
    this.logger.debug("searchWithCursor", { query, limit, cursor });

    const sanitizedQuery = query.replace(/[%_]/g, "\\$&");
    
    // Decode cursor (base64 encoded last ID)
    let lastId: number | null = null;
    if (cursor) {
      try {
        lastId = parseInt(Buffer.from(cursor, "base64").toString("utf-8"), 10);
      } catch {
        lastId = null;
      }
    }

    // Build query with cursor condition
    const baseConditions = [
      like(folders.name, `%${sanitizedQuery}%`),
      this.notDeleted(),
    ];
    
    if (lastId !== null) {
      baseConditions.push(gt(folders.id, lastId));
    }

    // Fetch limit + 1 to check if there are more results
    const records = await this.db
      .select()
      .from(folders)
      .where(and(...baseConditions))
      .orderBy(folders.id)
      .limit(limit + 1);

    const hasMore = records.length > limit;
    const data = records.slice(0, limit).map((r) => this.toFolder(r));
    
    // Encode next cursor
    const nextCursor = hasMore && data.length > 0
      ? Buffer.from(String(data[data.length - 1].id)).toString("base64")
      : null;

    return {
      data,
      cursor: {
        next: nextCursor,
        hasMore,
      },
    };
  }

  /**
   * Counts total folders.
   */
  async count(includeDeleted = false): Promise<number> {
    this.logger.debug("count", { includeDeleted });

    const condition = includeDeleted ? undefined : this.notDeleted();
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(folders)
      .where(condition);

    return result[0]?.count ?? 0;
  }

  /**
   * Creates a new folder with parent validation.
   * Uses transaction for data integrity - rolls back on any error.
   */
  async create(name: string, parentId: number | null, isFolder: boolean): Promise<Folder> {
    this.logger.debug("create", { name, parentId, isFolder });

    return await withTransaction(async (tx) => {
      // Validate parent exists if specified (within transaction)
      if (parentId !== null) {
        const parent = await this.findById(parentId);
        if (!parent) {
          throw new FolderNotFoundException(parentId);
        }
        if (!parent.isFolder) {
          throw new ParentNotFolderException(parentId);
        }
      }

      // Insert the folder
      const result = await tx.insert(folders).values({
        name,
        parentId,
        isFolder,
      });

      const insertId = result[0].insertId;
      
      // Verify the insert succeeded
      const created = await this.findById(insertId);
      if (!created) {
        throw new FolderCreationFailedException({ insertId });
      }

      return created;
    });
  }

  /**
   * Updates a folder's name.
   * Uses transaction - rolls back if folder doesn't exist.
   */
  async update(id: number, name: string): Promise<Folder> {
    this.logger.debug("update", { id, name });

    return await withTransaction(async (tx) => {
      const existing = await this.findById(id);
      if (!existing) throw new FolderNotFoundException(id);

      await tx
        .update(folders)
        .set({ name })
        .where(eq(folders.id, id));

      return { ...existing, name };
    });
  }

  /**
   * Soft deletes a folder and all its descendants.
   * Uses transaction - all deletes succeed or all fail atomically.
   */
  async delete(id: number): Promise<void> {
    this.logger.debug("delete (soft)", { id });

    await withTransaction(async (tx) => {
      const existing = await this.findById(id);
      if (!existing) throw new FolderNotFoundException(id);

      const idsToDelete = await this.collectDescendantIds(id);
      idsToDelete.push(id);

      const now = new Date();
      if (idsToDelete.length > 0) {
        await tx
          .update(folders)
          .set({ deletedAt: now })
          .where(inArray(folders.id, idsToDelete));
      }
    });
  }

  /**
   * Permanently deletes a folder and all its descendants.
   * Uses transaction - cannot be undone, but atomic.
   */
  async hardDelete(id: number): Promise<void> {
    this.logger.debug("hardDelete", { id });

    await withTransaction(async (tx) => {
      const existing = await this.findById(id, true); // Include deleted
      if (!existing) throw new FolderNotFoundException(id);

      const idsToDelete = await this.collectDescendantIds(id, true);
      idsToDelete.push(id);

      if (idsToDelete.length > 0) {
        await tx.delete(folders).where(inArray(folders.id, idsToDelete));
      }
    });
  }

  /**
   * Restores a soft-deleted folder and all its descendants.
   * Uses transaction - all restores succeed or all fail atomically.
   */
  async restore(id: number): Promise<Folder> {
    this.logger.debug("restore", { id });

    return await withTransaction(async (tx) => {
      const existing = await this.findById(id, true);
      if (!existing) throw new FolderNotFoundException(id);
      if (!existing.deletedAt) throw new FolderNotDeletedException(id);

      // Restore the folder and all its descendants
      const idsToRestore = await this.collectDescendantIds(id, true);
      idsToRestore.push(id);

      await tx
        .update(folders)
        .set({ deletedAt: null })
        .where(inArray(folders.id, idsToRestore));

      const restored = await this.findById(id);
      if (!restored) throw new Error("Failed to restore folder");

      return restored;
    });
  }

  /**
   * Collects all descendant IDs using BFS (breadth-first search).
   * More efficient than recursive queries - uses batched approach.
   */
  private async collectDescendantIds(parentId: number, includeDeleted = false): Promise<number[]> {
    const allIds: number[] = [];
    let currentParentIds = [parentId];

    while (currentParentIds.length > 0) {
      const condition = includeDeleted
        ? inArray(folders.parentId, currentParentIds)
        : and(inArray(folders.parentId, currentParentIds), this.notDeleted());

      const children = await this.db
        .select({ id: folders.id })
        .from(folders)
        .where(condition);

      const childIds = children.map((c) => c.id);
      allIds.push(...childIds);
      currentParentIds = childIds;
    }

    return allIds;
  }
}
