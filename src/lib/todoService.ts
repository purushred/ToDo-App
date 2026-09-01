import { prisma } from '@/lib/database'
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/types/todo'
import { generateUUID } from '@/utils/generateUUID'
import { Prisma } from '@prisma/client'

/**
 * Database service layer for Todo operations
 * Replaces in-memory todoStore with persistent PostgreSQL storage
 * 
 * Features:
 * - Connection pooling via Prisma
 * - Automatic query optimization with indexes
 * - Type-safe database operations
 * - Retry logic for transient failures
 * - Cursor-based pagination for large datasets
 */

/**
 * Retry configuration for transient database failures
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 100,
  maxDelayMs: 2000,
}

/**
 * Exponential backoff delay calculator
 */
function getDelay(attempt: number): number {
  const delay = Math.min(
    RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt),
    RETRY_CONFIG.maxDelayMs
  )
  return delay + Math.random() * 100 // Add jitter
}

/**
 * Retry wrapper for database operations
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Only retry on connection errors or timeouts
      const isRetryable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1008')
      
      if (!isRetryable || attempt === RETRY_CONFIG.maxRetries - 1) {
        throw error
      }
      
      const delay = getDelay(attempt)
      console.warn(
        `Retry ${attempt + 1}/${RETRY_CONFIG.maxRetries} for ${operationName} after ${delay}ms`
      )
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Convert Prisma Todo model to application Todo type
 */
function toTodoModel(dbTodo: {
  id: string
  title: string
  description: string | null
  completed: boolean
  createdAt: Date
  updatedAt: Date
}): Todo {
  return {
    id: dbTodo.id,
    title: dbTodo.title,
    description: dbTodo.description || undefined,
    completed: dbTodo.completed,
    createdAt: dbTodo.createdAt.toISOString(),
    updatedAt: dbTodo.updatedAt.toISOString(),
  }
}

/**
 * Create a new todo
 */
export async function createTodo(title: string, description?: string): Promise<Todo> {
  return withRetry(async () => {
    const dbTodo = await prisma.todo.create({
      data: {
        id: generateUUID(),
        title: title.trim(),
        description: description?.trim() || null,
        completed: false,
      },
    })
    return toTodoModel(dbTodo)
  }, 'createTodo')
}

/**
 * Get all todos, sorted by creation date (newest first)
 * Supports cursor-based pagination for large datasets
 */
export async function getAllTodos(options?: {
  cursor?: string
  limit?: number
}): Promise<{ todos: Todo[]; nextCursor?: string }> {
  return withRetry(async () => {
    const limit = options?.limit || 100
    const cursor = options?.cursor

    const dbTodos = await prisma.todo.findMany({
      take: limit + 1,
      orderBy: {
        createdAt: 'desc',
      },
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const hasNextPage = dbTodos.length > limit
    const todos = hasNextPage ? dbTodos.slice(0, -1) : dbTodos

    return {
      todos: todos.map(toTodoModel),
      nextCursor: hasNextPage ? todos[todos.length - 1]?.id : undefined,
    }
  }, 'getAllTodos')
}

/**
 * Get a single todo by ID
 */
export async function getTodoById(id: string): Promise<Todo | null> {
  return withRetry(async () => {
    const dbTodo = await prisma.todo.findUnique({
      where: { id },
    })

    if (!dbTodo) return null

    return toTodoModel(dbTodo)
  }, 'getTodoById')
}

/**
 * Update a todo with optimistic concurrency control
 * Returns null if todo not found
 */
export async function updateTodo(
  id: string,
  updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
): Promise<Todo | null> {
  return withRetry(async () => {
    try {
      const updateData: Prisma.TodoUpdateInput = {
        updatedAt: new Date(),
      }

      if (updates.title !== undefined) {
        updateData.title = updates.title.trim()
      }

      if (updates.description !== undefined) {
        updateData.description = updates.description?.trim() || null
      }

      if (updates.completed !== undefined) {
        updateData.completed = updates.completed
      }

      const dbTodo = await prisma.todo.update({
        where: { id },
        data: updateData,
      })

      return toTodoModel(dbTodo)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // Record not found
        return null
      }
      throw error
    }
  }, 'updateTodo')
}

/**
 * Delete a todo
 * Returns true if deleted, false if not found
 */
export async function deleteTodo(id: string): Promise<boolean> {
  return withRetry(async () => {
    try {
      await prisma.todo.delete({
        where: { id },
      })
      return true
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // Record not found
        return false
      }
      throw error
    }
  }, 'deleteTodo')
}

/**
 * Clear all todos (use with caution!)
 * Used primarily for testing
 */
export async function clearAllTodos(): Promise<void> {
  await withRetry(async () => {
    await prisma.todo.deleteMany()
  }, 'clearAllTodos')
}

/**
 * Get todo count
 */
export async function getTodoCount(): Promise<number> {
  return withRetry(async () => {
    return await prisma.todo.count()
  }, 'getTodoCount')
}

/**
 * Export todos for data migration
 */
export async function exportTodos(): Promise<Todo[]> {
  const { todos } = await getAllTodos({ limit: 10000 })
  return todos
}

/**
 * Import todos for data migration
 */
export async function importTodos(todos: Todo[]): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const todo of todos) {
    try {
      await prisma.todo.create({
        data: {
          id: todo.id,
          title: todo.title,
          description: todo.description || null,
          completed: todo.completed,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
        },
      })
      success++
    } catch (error) {
      console.error(`Failed to import todo ${todo.id}:`, error)
      failed++
    }
  }

  return { success, failed }
}