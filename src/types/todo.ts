/**
 * Todo Types
 * Aligned with Prisma schema as source of truth
 */

/**
 * Todo model matching Prisma schema
 * Database fields: id, title, description, completed, createdAt, updatedAt
 */
export interface Todo {
  id: string
  title: string
  description?: string | null
  completed: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Request to create a new todo
 */
export interface CreateTodoRequest {
  title: string
  description?: string | null
}

/**
 * Request to update an existing todo
 */
export interface UpdateTodoRequest {
  title?: string
  description?: string | null
  completed?: boolean
}

/**
 * Legacy error response - kept for backward compatibility
 * @deprecated Use ErrorResponse from types/api-responses instead
 */
export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
}