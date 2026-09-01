import { NextRequest } from 'next/server'
import { getTodoById, updateTodo, deleteTodo } from '@/lib/todoService'
import { handleOptions, successResponse, errorResponse } from '@/lib/responseHelpers'
import { updateTodoSchema, replaceTodoSchema, todoIdSchema } from '@/lib/validations/todo'
import { ErrorCode, HttpStatus } from '@/types/api-responses'

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/todos/[id]
 * Get a single todo by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Validate ID format
    const idValidation = todoIdSchema.safeParse(params.id)
    if (!idValidation.success) {
      return errorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Invalid todo ID format',
        HttpStatus.BAD_REQUEST
      )
    }

    const todo = await getTodoById(params.id)

    if (!todo) {
      return errorResponse(
        ErrorCode.NOT_FOUND,
        `Todo with id ${params.id} not found`,
        HttpStatus.NOT_FOUND
      )
    }

    return successResponse({ data: todo })
  } catch (error) {
    console.error('Error fetching todo:', error)
    
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
      'Failed to fetch todo',
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}

/**
 * PUT /api/todos/[id]
 * Replace a todo (full update)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Validate ID format
    const idValidation = todoIdSchema.safeParse(params.id)
    if (!idValidation.success) {
      return errorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Invalid todo ID format',
        HttpStatus.BAD_REQUEST
      )
    }

    const existing = await getTodoById(params.id)
    if (!existing) {
      return errorResponse(
        ErrorCode.NOT_FOUND,
        `Todo with id ${params.id} not found`,
        HttpStatus.NOT_FOUND
      )
    }

    const body = await request.json()

    // Validate using Zod schema
    const validationResult = replaceTodoSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0]?.message || 'Validation failed'
      return errorResponse(
        ErrorCode.VALIDATION_ERROR,
        errorMessage,
        HttpStatus.BAD_REQUEST
      )
    }

    const { title, description, completed } = validationResult.data

    const updated = await updateTodo(params.id, {
      title,
      description,
      completed,
    })

    return successResponse({ data: updated })
  } catch (error) {
    console.error('Error updating todo:', error)
    
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
      'Failed to update todo',
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}

/**
 * PATCH /api/todos/[id]
 * Partial update of a todo
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Validate ID format
    const idValidation = todoIdSchema.safeParse(params.id)
    if (!idValidation.success) {
      return errorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Invalid todo ID format',
        HttpStatus.BAD_REQUEST
      )
    }

    const existing = await getTodoById(params.id)
    if (!existing) {
      return errorResponse(
        ErrorCode.NOT_FOUND,
        `Todo with id ${params.id} not found`,
        HttpStatus.NOT_FOUND
      )
    }

    const body = await request.json()

    // Validate using Zod schema
    const validationResult = updateTodoSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0]?.message || 'Validation failed'
      return errorResponse(
        ErrorCode.VALIDATION_ERROR,
        errorMessage,
        HttpStatus.BAD_REQUEST
      )
    }

    const updates = validationResult.data

    // Check if there's anything to update
    if (Object.keys(updates).length === 0) {
      return errorResponse(
        ErrorCode.VALIDATION_ERROR,
        'No valid update fields provided',
        HttpStatus.BAD_REQUEST
      )
    }

    const updated = await updateTodo(params.id, updates)
    return successResponse({ data: updated })
  } catch (error) {
    console.error('Error updating todo:', error)
    
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
      'Failed to update todo',
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}

/**
 * DELETE /api/todos/[id]
 * Delete a todo
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Validate ID format
    const idValidation = todoIdSchema.safeParse(params.id)
    if (!idValidation.success) {
      return errorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Invalid todo ID format',
        HttpStatus.BAD_REQUEST
      )
    }

    const deleted = await deleteTodo(params.id)

    if (!deleted) {
      return errorResponse(
        ErrorCode.NOT_FOUND,
        `Todo with id ${params.id} not found`,
        HttpStatus.NOT_FOUND
      )
    }

    return successResponse({
      data: null,
      message: `Todo ${params.id} deleted successfully`,
    })
  } catch (error) {
    console.error('Error deleting todo:', error)
    
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
      'Failed to delete todo',
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