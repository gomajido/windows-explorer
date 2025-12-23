/**
 * Base repository interface
 * Defines common CRUD operations for all repositories
 */
export interface IBaseRepository<T, CreateDto, UpdateDto> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: CreateDto): Promise<T>;
  update(id: number, data: UpdateDto): Promise<T>;
  delete(id: number): Promise<void>;
  count(): Promise<number>;
}

/**
 * Soft delete repository interface
 */
export interface ISoftDeleteRepository<T> {
  findById(id: number, includeDeleted?: boolean): Promise<T | null>;
  softDelete(id: number): Promise<void>;
  hardDelete(id: number): Promise<void>;
  restore(id: number): Promise<T>;
}

/**
 * Paginated repository interface
 */
export interface IPaginatedRepository<T, Options> {
  findAllPaginated(options?: Options): Promise<PaginatedResult<T>>;
}

/**
 * Paginated result type
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
