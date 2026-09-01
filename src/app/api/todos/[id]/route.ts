import { NextRequest } from 'next/server'
import { todoStore } from '@/lib/todoStore'
import { handleOptions, successResponse, errorResponse } from '@/lib/responseHelpers'
import { UpdateTodoRequest } from '@/types/todo'

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/todos/[id]
 * Get a single todo by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const todo = todoStore.getById(params.id)

  if (!todo) {
    return errorResponse(
      'NotFoundError',
      `Todo with id ${params.id} not found`,
      404
    )
  }

  return successResponse({ data: todo })
}

/**
 * PUT /api/todos/[id]
 * Replace a todo (full update)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const existing = todoStore.getById(params.id)
  if (!existing) {
    return errorResponse(
      'NotFoundError',
      `Todo with id ${params.id} not found`,
      404
    )
  }

  try {
    const body = await request.json()

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

    // Validate completed
    if (body.completed !== undefined && typeof body.completed !== 'boolean') {
      return errorResponse(
        'ValidationError',
        'Completed must be a boolean',
        400
      )
    }

    // Validate description
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

    const updated = todoStore.update(params.id, {
      title: trimmedTitle,
      description: body.description,
      completed: body.completed || false,
    })

    return successResponse({ data: updated })
  } catch (error) {
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
 * PATCH /api/todos/[id]
 * Partial update of a todo
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const existing = todoStore.getById(params.id)
  if (!existing) {
    return errorResponse(
      'NotFoundError',
      `Todo with id ${params.id} not found`,
      404
    )
  }

  try {
    const body = (await request.json()) as UpdateTodoRequest
    const updates: Partial<UpdateTodoRequest> = {}

    // Validate and prepare title update
    if (body.title !== undefined) {
      if (typeof body.title !== 'string') {
        return errorResponse(
          'ValidationError',
          'Title must be a string',
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

      updates.title = trimmedTitle
    }

    // Validate and prepare description update
    if (body.description !== undefined) {
      if (body.description !== null && typeof body.description !== 'string') {
        return errorResponse(
          'ValidationError',
          'Description must be a string or null',
          400
        )
      }

      if (body.description !== null && body.description.length > 5000) {
        return errorResponse(
          'ValidationError',
          'Description must be 5000 characters or less',
          400
        )
      }

      updates.description = body.description
    }

    // Validate and prepare completed update
    if (body.completed !== undefined) {
      if (typeof body.completed !== 'boolean') {
        return errorResponse(
          'ValidationError',
          'Completed must be a boolean',
          400
        )
      }
      updates.completed = body.completed
    }

    // Check if there's anything to update
    if (Object.keys(updates).length === 0) {
      return errorResponse(
        'ValidationError',
        'No valid update fields provided',
        400
      )
    }

    const updated = todoStore.update(params.id, updates)
    return successResponse({ data: updated })
  } catch (error) {
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
 * DELETE /api/todos/[id]
 * Delete a todo
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const deleted = todoStore.delete(params.id)

  if (!deleted) {
    return errorResponse(
      'NotFoundError',
      `Todo with id ${params.id} not found`,
      404
    )
  }

  return successResponse({
    data: null,
    message: `Todo ${params.id} deleted successfully`,
  })
}

/**
 * Handle OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return handleOptions()
}