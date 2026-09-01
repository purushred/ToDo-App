import { NextRequest } from 'next/server'
import { createTodo, getAllTodos, getTodoCount } from '@/lib/todoService'
import { handleOptions, successResponse, errorResponse } from '@/lib/responseHelpers'
import { CreateTodoRequest } from '@/types/todo'

/**
 * GET /api/todos
 * List all todos with pagination support
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100

    const { todos, nextCursor } = await getAllTodos({ cursor, limit })
    const count = await getTodoCount()

    return successResponse({
      data: todos,
      count,
      nextCursor,
    })
  } catch (error) {
    console.error('Error fetching todos:', error)
    
    // Check for connection pool exhaustion
    if (error instanceof Error && error.message.includes('connection')) {
      return errorResponse(
        'ServiceUnavailable',
        'Database connection pool exhausted. Please try again later.',
        503
      )
    }
    
    return errorResponse(
      'DatabaseError',
      'Failed to fetch todos',
      500
    )
  }
}

/**
 * POST /api/todos
 * Create a new todo
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateTodoRequest

    // Validate title
    if (!body.title || typeof body.title !== 'string') {
      return errorResponse(
        'ValidationError',
        'Title is required and must be a string',
        400
      )
    }

    const trimmedTitle = body.title.trim()
    if (trimmedTitle.length === 0) {
      return errorResponse(
        'ValidationError',
        'Title cannot be empty',
        400
      )
    }

    if (trimmedTitle.length > 200) {
      return errorResponse(
        'ValidationError',
        'Title must be 200 characters or less',
        400
      )
    }

    // Validate description if provided
    if (body.description !== undefined && body.description !== null) {
      if (typeof body.description !== 'string') {
        return errorResponse(
          'ValidationError',
          'Description must be a string',
          400
        )
      }

      if (body.description.length > 5000) {
        return errorResponse(
          'ValidationError',
          'Description must be 5000 characters or less',
          400
        )
      }
    }

    const todo = await createTodo(trimmedTitle, body.description)
    return successResponse({ data: todo }, 201)
  } catch (error) {
    console.error('Error creating todo:', error)
    
    // Handle malformed JSON
    if (error instanceof SyntaxError) {
      return errorResponse(
        'ParseError',
        'Invalid JSON in request body',
        400
      )
    }
    
    // Check for connection pool exhaustion
    if (error instanceof Error && error.message.includes('connection')) {
      return errorResponse(
        'ServiceUnavailable',
        'Database connection pool exhausted. Please try again later.',
        503
      )
    }
    
    return errorResponse(
      'DatabaseError',
      'Failed to create todo',
      500
    )
  }
}

/**
 * Handle OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return handleOptions()
}