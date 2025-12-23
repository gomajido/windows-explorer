/**
 * Base application exception
 * All custom exceptions extend this class
 */
export class AppException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Entity not found exception
 */
export class NotFoundException extends AppException {
  constructor(entity: string, id?: string | number, details?: Record<string, unknown>) {
    super(
      `${entity.toUpperCase()}_NOT_FOUND`,
      id ? `${entity} with id ${id} not found` : `${entity} not found`,
      404,
      details
    );
  }
}

/**
 * Validation exception
 */
export class ValidationException extends AppException {
  constructor(message: string, details?: Record<string, unknown>) {
    super("VALIDATION_ERROR", message, 400, details);
  }
}

/**
 * Business rule violation exception
 */
export class BusinessRuleException extends AppException {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(code, message, 422, details);
  }
}

/**
 * Unauthorized exception
 */
export class UnauthorizedException extends AppException {
  constructor(message = "Unauthorized", details?: Record<string, unknown>) {
    super("UNAUTHORIZED", message, 401, details);
  }
}

/**
 * Forbidden exception
 */
export class ForbiddenException extends AppException {
  constructor(message = "Forbidden", details?: Record<string, unknown>) {
    super("FORBIDDEN", message, 403, details);
  }
}

/**
 * Conflict exception (e.g., duplicate entry)
 */
export class ConflictException extends AppException {
  constructor(message: string, details?: Record<string, unknown>) {
    super("CONFLICT", message, 409, details);
  }
}

/**
 * Database exception
 */
export class DatabaseException extends AppException {
  constructor(message: string, details?: Record<string, unknown>) {
    super("DATABASE_ERROR", message, 500, details);
  }
}
