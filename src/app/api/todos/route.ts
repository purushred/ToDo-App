import { NextRequest } from 'next/server'
import { createTodo, getAllTodos, getTodoCount } from '@/lib/todoService'
import { handleOptions, successResponse, errorResponse } from '@/lib/responseHelpers'
import { createTodoSchema, todoListQuerySchema } from '@/lib/validations/todo'
import { ErrorCode, HttpStatus } from '@/types/api-responses'

/**
 * GET /api/todos
 * List all todos with pagination support
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Validate query parameters
    const queryResult = todoListQuerySchema.safeParse({
      cursor: searchParams.get('cursor') || undefined,
      limit: searchParams.get('limit') || undefined,
    })

    if (!queryResult.success) {
      return errorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Invalid query parameters',
        HttpStatus.BAD_REQUEST
      )
    }

    const { cursor, limit } = queryResult.data
    const { todos, nextCursor } = await getAllTodos({ cursor, limit })
    const count = await getTodoCount()

    return successResponse({
      data: todos,
      count,
      nextCursor,
      hasMore: !!nextCursor,
    })
  } catch (error) {
    console.error('Error fetching todos:', error)
    
    // Check for connection pool exhaustion
    if (error instanceof Error && error.message.includes('connection')) {
      return errorResponse(
        ErrorCode.SERVICE_UNAVAILABLE,
        'Database connection pool exhausted. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE
      )
    }
    
    return errorResponse(
      ErrorCode.DATABASE_ERROR,
      'Failed to fetch todos',
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}

/**
 * POST /api/todos
 * Create a new todo
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input using Zod schema
    const validationResult = createTodoSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0]?.message || 'Validation failed'
      return errorResponse(
        ErrorCode.VALIDATION_ERROR,
        errorMessage,
        HttpStatus.BAD_REQUEST
      )
    }

    const { title, description } = validationResult.data
    const todo = await createTodo(title, description || undefined)
    
    return successResponse({ data: todo }, HttpStatus.CREATED)
  } catch (error) {
    console.error('Error creating todo:', error)
    
    // Handle malformed JSON
    if (error instanceof SyntaxError) {
      return errorResponse(
        ErrorCode.PARSE_ERROR,
        'Invalid JSON in request body',
        HttpStatus.BAD_REQUEST
      )
    }
    
    // Check for connection pool exhaustion
    if (error instanceof Error && error.message.includes('connection')) {
      return errorResponse(
        ErrorCode.SERVICE_UNAVAILABLE,
        'Database connection pool exhausted. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE
      )
    }
    
    return errorResponse(
      ErrorCode.DATABASE_ERROR,
      'Failed to create todo',
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}

/**
 * Handle OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return handleOptions()
}