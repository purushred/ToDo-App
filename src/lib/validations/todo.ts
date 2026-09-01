/**
 * Todo Validation Schemas
 * Shared Zod schemas for frontend and backend validation
 */

import { z } from 'zod'

/**
 * Todo title validation
 * - Required string
 * - Trimmed
 * - 1-200 characters
 */
export const todoTitleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(200, 'Title must be 200 characters or less')

/**
 * Todo description validation
 * - Optional string or null
 * - Max 5000 characters
 */
export const todoDescriptionSchema = z
  .string()
  .trim()
  .max(5000, 'Description must be 5000 characters or less')
  .nullable()
  .optional()

/**
 * Todo completed validation
 * - Optional boolean
 */
export const todoCompletedSchema = z.boolean().optional()

/**
 * Create todo request schema
 */
export const createTodoSchema = z.object({
  title: todoTitleSchema,
  description: todoDescriptionSchema,
})

/**
 * Update todo request schema (partial updates)
 */
export const updateTodoSchema = z.object({
  title: todoTitleSchema.optional(),
  description: todoDescriptionSchema,
  completed: todoCompletedSchema,
})

/**
 * Replace todo request schema (full updates)
 */
export const replaceTodoSchema = z.object({
  title: todoTitleSchema,
  description: todoDescriptionSchema,
  completed: z.boolean().default(false),
})

/**
 * Todo ID validation (UUID format)
 */
export const todoIdSchema = z
  .string()
  .uuid('Invalid todo ID format')

/**
 * Todo list query parameters schema
 */
export const todoListQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(100),
})

// Type exports for use in components and server actions
export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
export type ReplaceTodoInput = z.infer<typeof replaceTodoSchema>
export type TodoListQuery = z.infer<typeof todoListQuerySchema>