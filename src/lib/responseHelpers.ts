import { NextResponse } from 'next/server'
import { ErrorResponse } from '@/types/todo'

/**
 * CORS headers for local development
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/**
 * Apply CORS headers to response
 */
export function applyCors<T>(response: NextResponse<T>): NextResponse<T> {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<T> {
  const response = NextResponse.json(data, { status })
  return applyCors(response)
}

/**
 * Error response helper
 */
export function errorResponse(
  error: string,
  message: string,
  statusCode: number
): NextResponse<ErrorResponse> {
  const body: ErrorResponse = { error, message, statusCode }
  const response = NextResponse.json(body, { status: statusCode })
  return applyCors(response)
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleOptions(): NextResponse {
  const response = new NextResponse(null, { status: 204 })
  return applyCors(response)
}