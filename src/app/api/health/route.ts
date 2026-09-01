import { NextRequest } from 'next/server'
import { handleOptions, successResponse, errorResponse } from '@/lib/responseHelpers'

/**
 * GET /api/health
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  return successResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}

/**
 * Handle OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return handleOptions()
}