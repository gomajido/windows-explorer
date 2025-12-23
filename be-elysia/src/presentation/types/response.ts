export interface ErrorInfo {
  field?: string;
  message: string;
  code?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  httpCode: number;
  message: string;
  code: string;
  detail?: string;
  data?: T;
  pagination?: Pagination;
  errors?: ErrorInfo[];
}

// Response codes
export const ResponseCode = {
  SUCCESS: "SUCCESS",
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  DELETED: "DELETED",
  NOT_FOUND: "NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

// Helper functions to create responses
export const ApiResponseHelper = {
  success<T>(data: T, message = "Success"): ApiResponse<T> {
    return {
      httpCode: 200,
      message,
      code: ResponseCode.SUCCESS,
      data,
    };
  },

  created<T>(data: T, message = "Created successfully"): ApiResponse<T> {
    return {
      httpCode: 201,
      message,
      code: ResponseCode.CREATED,
      data,
    };
  },

  updated<T>(data: T, message = "Updated successfully"): ApiResponse<T> {
    return {
      httpCode: 200,
      message,
      code: ResponseCode.UPDATED,
      data,
    };
  },

  deleted(message = "Deleted successfully"): ApiResponse<null> {
    return {
      httpCode: 200,
      message,
      code: ResponseCode.DELETED,
      data: null,
    };
  },

  notFound(detail?: string): ApiResponse<null> {
    return {
      httpCode: 404,
      message: "Resource not found",
      code: ResponseCode.NOT_FOUND,
      detail,
      data: null,
    };
  },

  badRequest(detail?: string, errors?: ErrorInfo[]): ApiResponse<null> {
    return {
      httpCode: 400,
      message: "Bad request",
      code: ResponseCode.BAD_REQUEST,
      detail,
      data: null,
      errors,
    };
  },

  unauthorized(detail?: string): ApiResponse<null> {
    return {
      httpCode: 401,
      message: "Unauthorized",
      code: ResponseCode.UNAUTHORIZED,
      detail,
      data: null,
    };
  },

  forbidden(detail?: string): ApiResponse<null> {
    return {
      httpCode: 403,
      message: "Forbidden",
      code: ResponseCode.FORBIDDEN,
      detail,
      data: null,
    };
  },

  error(detail?: string): ApiResponse<null> {
    return {
      httpCode: 500,
      message: "Internal server error",
      code: ResponseCode.INTERNAL_ERROR,
      detail,
      data: null,
    };
  },

  paginated<T>(
    data: T[],
    pagination: Pagination,
    message = "Success"
  ): ApiResponse<T[]> {
    return {
      httpCode: 200,
      message,
      code: ResponseCode.SUCCESS,
      data,
      pagination,
    };
  },
};
