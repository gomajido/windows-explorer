import { db, type Database } from "./connection";
import { ENV } from "../config";

/**
 * Unit of Work interface
 * Manages transactions across multiple repository operations
 */
export interface IUnitOfWork {
  /**
   * Execute operations within a transaction
   * All operations succeed or all fail
   */
  transaction<T>(work: (tx: Database) => Promise<T>): Promise<T>;

  /**
   * Get the database instance
   */
  getDb(): Database;
}

/**
 * Unit of Work implementation
 * Provides transaction management for database operations
 * 
 * Usage:
 * ```typescript
 * const uow = new UnitOfWork();
 * await uow.transaction(async (tx) => {
 *   const folderRepo = new FolderRepository(tx);
 *   await folderRepo.create(...);
 *   await folderRepo.update(...);
 *   // All operations commit together or rollback on error
 * });
 * ```
 */
export class UnitOfWork implements IUnitOfWork {
  private readonly logger = {
    debug: (...args: unknown[]) => {
      if (ENV.isDevelopment) {
        console.log("[UnitOfWork]", ...args);
      }
    },
    error: (...args: unknown[]) => {
      console.error("[UnitOfWork] Error:", ...args);
    },
  };

  constructor(private readonly database: Database = db) {}

  /**
   * Execute work within a database transaction
   * Automatically commits on success, rolls back on error
   */
  async transaction<T>(work: (tx: Database) => Promise<T>): Promise<T> {
    this.logger.debug("Starting transaction");

    try {
      // Drizzle ORM transaction
      const result = await this.database.transaction(async (tx) => {
        return await work(tx as unknown as Database);
      });

      this.logger.debug("Transaction committed");
      return result;
    } catch (error) {
      this.logger.error("Transaction rolled back", error);
      throw error;
    }
  }

  /**
   * Get the underlying database instance
   */
  getDb(): Database {
    return this.database;
  }
}

/**
 * Repository Factory
 * Creates repository instances with proper dependency injection
 */
export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private readonly unitOfWork: UnitOfWork;

  private constructor(database: Database = db) {
    this.unitOfWork = new UnitOfWork(database);
  }

  /**
   * Get singleton instance
   */
  static getInstance(database?: Database): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory(database);
    }
    return RepositoryFactory.instance;
  }

  /**
   * Get the unit of work for transaction management
   */
  getUnitOfWork(): UnitOfWork {
    return this.unitOfWork;
  }

  /**
   * Execute operations in a transaction
   */
  async withTransaction<T>(work: (tx: Database) => Promise<T>): Promise<T> {
    return this.unitOfWork.transaction(work);
  }
}

// Default export for convenience
export const repositoryFactory = RepositoryFactory.getInstance();
