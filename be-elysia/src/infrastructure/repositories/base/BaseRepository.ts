import { eq, sql, isNull, inArray } from "drizzle-orm";
import type { MySqlTable } from "drizzle-orm/mysql-core";
import type { Database } from "../../database/connection";
import { DatabaseException } from "../../../domain/shared/exceptions";
import { ENV } from "../../config";

/**
 * Logger interface for repository operations
 */
interface RepositoryLogger {
  debug(method: string, ...args: unknown[]): void;
  error(method: string, error: unknown): void;
}

/**
 * Base repository configuration
 */
export interface BaseRepositoryConfig<TTable extends MySqlTable> {
  db: Database;
  table: TTable;
  entityName: string;
}

/**
 * Abstract Base Repository
 * Provides common CRUD operations and utilities for all repositories
 * 
 * Features:
 * - Generic CRUD operations
 * - Soft delete support (optional)
 * - Logging
 * - Error handling
 */
export abstract class BaseRepository<
  TTable extends MySqlTable,
  TEntity,
  TRecord
> {
  protected readonly db: Database;
  protected readonly table: TTable;
  protected readonly entityName: string;

  protected readonly logger: RepositoryLogger = {
    debug: (method: string, ...args: unknown[]) => {
      if (ENV.isDevelopment) {
        console.log(`[${this.entityName}Repo.${method}]`, ...args);
      }
    },
    error: (method: string, error: unknown) => {
      console.error(`[${this.entityName}Repo.${method}] Error:`, error);
    },
  };

  constructor(config: BaseRepositoryConfig<TTable>) {
    this.db = config.db;
    this.table = config.table;
    this.entityName = config.entityName;
  }

  /**
   * Maps a database record to a domain entity
   * Must be implemented by subclasses
   */
  protected abstract toEntity(record: TRecord): TEntity;

  /**
   * Gets the ID column for the table
   * Must be implemented by subclasses
   */
  protected abstract getIdColumn(): any;

  /**
   * Wraps database operations with error handling
   */
  protected async executeQuery<T>(
    operation: string,
    query: () => Promise<T>
  ): Promise<T> {
    try {
      return await query();
    } catch (error) {
      this.logger.error(operation, error);
      throw new DatabaseException(
        `Database error during ${operation}: ${error instanceof Error ? error.message : "Unknown error"}`,
        { operation, entity: this.entityName }
      );
    }
  }

  /**
   * Find entity by ID
   */
  async findById(id: number): Promise<TEntity | null> {
    this.logger.debug("findById", { id });

    const records = await this.executeQuery("findById", () =>
      this.db
        .select()
        .from(this.table)
        .where(eq(this.getIdColumn(), id))
        .limit(1)
    );

    return records.length > 0 ? this.toEntity(records[0] as TRecord) : null;
  }

  /**
   * Count all entities
   */
  async count(): Promise<number> {
    this.logger.debug("count");

    const result = await this.executeQuery("count", () =>
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(this.table)
    );

    return result[0]?.count ?? 0;
  }

  /**
   * Check if entity exists
   */
  async exists(id: number): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }
}

/**
 * Soft Delete Mixin
 * Adds soft delete capabilities to a repository
 */
export abstract class SoftDeleteRepository<
  TTable extends MySqlTable,
  TEntity,
  TRecord
> extends BaseRepository<TTable, TEntity, TRecord> {
  /**
   * Gets the deletedAt column for soft delete
   * Must be implemented by subclasses
   */
  protected abstract getDeletedAtColumn(): any;

  /**
   * Returns condition for excluding soft-deleted records
   */
  protected notDeleted() {
    return isNull(this.getDeletedAtColumn());
  }

  /**
   * Find by ID with soft delete support
   */
  async findById(id: number, includeDeleted = false): Promise<TEntity | null> {
    this.logger.debug("findById", { id, includeDeleted });

    const idCol = this.getIdColumn();
    const condition = includeDeleted
      ? eq(idCol, id)
      : sql`${eq(idCol, id)} AND ${this.notDeleted()}`;

    const records = await this.executeQuery("findById", () =>
      this.db
        .select()
        .from(this.table)
        .where(condition)
        .limit(1)
    );

    return records.length > 0 ? this.toEntity(records[0] as TRecord) : null;
  }

  /**
   * Soft delete - sets deletedAt timestamp
   */
  async softDelete(id: number): Promise<void> {
    this.logger.debug("softDelete", { id });

    await this.executeQuery("softDelete", () =>
      this.db
        .update(this.table)
        .set({ deletedAt: new Date() } as any)
        .where(eq(this.getIdColumn(), id))
    );
  }

  /**
   * Hard delete - permanently removes record
   */
  async hardDelete(id: number): Promise<void> {
    this.logger.debug("hardDelete", { id });

    await this.executeQuery("hardDelete", () =>
      this.db
        .delete(this.table)
        .where(eq(this.getIdColumn(), id))
    );
  }

  /**
   * Restore soft-deleted record
   */
  async restoreById(id: number): Promise<void> {
    this.logger.debug("restore", { id });

    await this.executeQuery("restore", () =>
      this.db
        .update(this.table)
        .set({ deletedAt: null } as any)
        .where(eq(this.getIdColumn(), id))
    );
  }

  /**
   * Batch soft delete
   */
  async softDeleteMany(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    this.logger.debug("softDeleteMany", { count: ids.length });

    await this.executeQuery("softDeleteMany", () =>
      this.db
        .update(this.table)
        .set({ deletedAt: new Date() } as any)
        .where(inArray(this.getIdColumn(), ids))
    );
  }

  /**
   * Batch hard delete
   */
  async hardDeleteMany(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    this.logger.debug("hardDeleteMany", { count: ids.length });

    await this.executeQuery("hardDeleteMany", () =>
      this.db
        .delete(this.table)
        .where(inArray(this.getIdColumn(), ids))
    );
  }

  /**
   * Batch restore
   */
  async restoreMany(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    this.logger.debug("restoreMany", { count: ids.length });

    await this.executeQuery("restoreMany", () =>
      this.db
        .update(this.table)
        .set({ deletedAt: null } as any)
        .where(inArray(this.getIdColumn(), ids))
    );
  }
}
