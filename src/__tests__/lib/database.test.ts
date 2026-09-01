import { prisma, checkDatabaseHealth, disconnectDatabase } from '@/lib/database'

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $queryRaw: jest.fn(),
    $disconnect: jest.fn(),
  })),
}))

describe('Database', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkDatabaseHealth', () => {
    it('should return healthy status when database is accessible', async () => {
      ;(prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

      const health = await checkDatabaseHealth()

      expect(health.status).toBe('healthy')
      expect(health.latency).toBeDefined()
      expect(health.latency).toBeGreaterThanOrEqual(0)
    })

    it('should return unhealthy status when database is not accessible', async () => {
      ;(prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Connection failed'))

      const health = await checkDatabaseHealth()

      expect(health.status).toBe('unhealthy')
      expect(health.error).toBe('Connection failed')
    })

    it('should measure query latency', async () => {
      ;(prisma.$queryRaw as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([{ '?column?': 1 }]), 50))
      )

      const health = await checkDatabaseHealth()

      expect(health.latency).toBeGreaterThanOrEqual(50)
    })
  })

  describe('disconnectDatabase', () => {
    it('should call $disconnect on prisma client', async () => {
      ;(prisma.$disconnect as jest.Mock).mockResolvedValue(undefined)

      await disconnectDatabase()

      expect(prisma.$disconnect).toHaveBeenCalled()
    })
  })
})