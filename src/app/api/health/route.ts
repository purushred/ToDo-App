import { NextRequest } from 'next/server'
import { handleOptions, successResponse, errorResponse } from '@/lib/responseHelpers'
import { checkDatabaseHealth } from '@/lib/database'

/**
 * GET /api/health
 * Health check endpoint with database connectivity check
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check database connectivity
    const dbHealth = await checkDatabaseHealth()
    const totalLatency = Date.now() - startTime
    
    // Performance benchmark: health check should complete in < 200ms
    const meetsPerformanceTarget = totalLatency < 200
    
    const healthStatus = {
      status: dbHealth.status === 'healthy' && meetsPerformanceTarget ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbHealth.status,
        latency: dbHealth.latency,
        ...(dbHealth.error && { error: dbHealth.error }),
      },
      performance: {
        totalLatency,
        meetsTarget: meetsPerformanceTarget,
        target: 200,
      },
    }
    
    // Return 503 if database is unhealthy
    const statusCode = dbHealth.status === 'healthy' ? 200 : 503
    
    return successResponse(healthStatus, statusCode)
  } catch (error) {
    console.error('Health check failed:', error)
    
    return errorResponse(
      'HealthCheckFailed',
      'Health check failed',
      503
    )
  }
}

/**
 * Handle OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return handleOptions()
}