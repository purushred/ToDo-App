/**
 * API Response Types
 * Standardized response shapes for all API endpoints
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  statusCode: number
  timestamp: string
  requestId?: string
}

/**
 * Success response shape
 */
export interface SuccessResponse<T = unknown> {
  data: T
  statusCode?: number
  message?: string
}

/**
 * Error response shape
 */
export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
  timestamp?: string
  requestId?: string
}

/**
 * Paginated response shape
 */
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  nextCursor?: string
  hasMore: boolean
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string
  message: string
  value?: unknown
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse extends ErrorResponse {
  error: 'ValidationError'
  details: ValidationError[]
}

/**
 * API Error codes
 */
export enum ErrorCode {
  // Client errors
  BAD_REQUEST = 'BadRequestError',
  UNAUTHORIZED = 'UnauthorizedError',
  FORBIDDEN = 'ForbiddenError',
  NOT_FOUND = 'NotFoundError',
  VALIDATION_ERROR = 'ValidationError',
  CONFLICT = 'ConflictError',
  
  // Server errors
  INTERNAL_ERROR = 'InternalServerError',
  SERVICE_UNAVAILABLE = 'ServiceUnavailable',
  DATABASE_ERROR = 'DatabaseError',
  PARSE_ERROR = 'ParseError',
}

/**
 * Action state for server actions
 */
export type ActionState<T = unknown, E = string> = 
  | { success: true; data: T; message?: string }
  | { success: false; error: E; message: string; details?: ValidationError[] }

/**
 * HTTP status codes enum
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}