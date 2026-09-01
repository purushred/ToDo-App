import { NextRequest } from 'next/server'
import { todoStore } from '@/lib/todoStore'
import { handleOptions, successResponse, errorResponse } from '@/lib/responseHelpers'
import { CreateTodoRequest } from '@/types/todo'

/**
 * GET /api/todos
 * List all todos
 */
export async function GET(request: NextRequest) {
  const todos = todoStore.getAll()
  return successResponse({
    data: todos,
    count: todos.length,
  })
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

    const todo = todoStore.create(trimmedTitle, body.description)
    return successResponse({ data: todo }, 201)
  } catch (error) {
    // Handle malformed JSON
    if (error instanceof SyntaxError) {
      return errorResponse(
        'ParseError',
        'Invalid JSON in request body',
        400
      )
    }
    throw error
  }
}

/**
 * Handle OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return handleOptions()
}