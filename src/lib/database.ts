import { PrismaClient } from '@prisma/client'

/**
 * Prisma client singleton pattern
 * Prevents connection exhaustion in development hot-reload scenarios
 * 
 * In development, Next.js hot-reloads can create multiple PrismaClient instances
 * This pattern ensures we reuse the same connection across hot reloads
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

/**
 * Prisma client instance with optimized connection pooling
 * 
 * Connection pool configuration:
 * - Default connection limit: 10 (adjust via DATABASE_URL parameter)
 * - Connection timeout: 10 seconds
 * - Pool timeout: 10 seconds
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Graceful shutdown handler
 * Ensures all database connections are properly closed
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}

/**
 * Health check for database connectivity
 * Used by /api/health endpoint
 */
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy'
  latency?: number
  error?: string
}> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - start
    return {
      status: 'healthy',
      latency,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown database error',
    }
  }
}

export type { PrismaClient }