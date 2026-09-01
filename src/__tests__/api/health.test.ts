import { GET, OPTIONS } from '@/app/api/health/route'
import * as database from '@/lib/database'

// Mock the database module
jest.mock('@/lib/database', () => ({
  checkDatabaseHealth: jest.fn(),
}))

// Mock NextRequest
function createRequest(): any {
  return {}
}

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 200 status when database is healthy', async () => {
      ;(database.checkDatabaseHealth as jest.Mock).mockResolvedValue({
        status: 'healthy',
        latency: 50,
      })

      const response = await GET(createRequest())
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('healthy')
      expect(data.database.status).toBe('healthy')
      expect(data.database.latency).toBe(50)
    })

    it('should include CORS headers', async () => {
      ;(database.checkDatabaseHealth as jest.Mock).mockResolvedValue({
        status: 'healthy',
        latency: 50,
      })

      const response = await GET(createRequest())

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type')
    })

    it('should return 503 when database is unhealthy', async () => {
      ;(database.checkDatabaseHealth as jest.Mock).mockResolvedValue({
        status: 'unhealthy',
        error: 'Connection failed',
      })

      const response = await GET(createRequest())
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('degraded')
      expect(data.database.status).toBe('unhealthy')
      expect(data.database.error).toBe('Connection failed')
    })

    it('should include performance metrics', async () => {
      ;(database.checkDatabaseHealth as jest.Mock).mockResolvedValue({
        status: 'healthy',
        latency: 50,
      })

      const response = await GET(createRequest())
      const data = await response.json()

      expect(data.performance).toBeDefined()
      expect(data.performance.totalLatency).toBeDefined()
      expect(data.performance.target).toBe(200)
      expect(data.performance.meetsTarget).toBeDefined()
    })

    it('should report degraded status when performance target not met', async () => {
      ;(database.checkDatabaseHealth as jest.Mock).mockImplementation(
        () => new Promise(resolve => 
          setTimeout(() => resolve({ status: 'healthy', latency: 250 }), 250)
        )
      )

      const response = await GET(createRequest())
      const data = await response.json()

      expect(data.status).toBe('degraded')
      expect(data.performance.meetsTarget).toBe(false)
    })

    it('should return uptime information', async () => {
      ;(database.checkDatabaseHealth as jest.Mock).mockResolvedValue({
        status: 'healthy',
        latency: 50,
      })

      const response = await GET(createRequest())
      const data = await response.json()

      expect(data.uptime).toBeDefined()
      expect(typeof data.uptime).toBe('number')
    })

    it('should return timestamp', async () => {
      ;(database.checkDatabaseHealth as jest.Mock).mockResolvedValue({
        status: 'healthy',
        latency: 50,
      })

      const response = await GET(createRequest())
      const data = await response.json()

      expect(data.timestamp).toBeDefined()
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp)
    })
  })

  describe('OPTIONS', () => {
    it('should return 204 with CORS headers', async () => {
      const response = await OPTIONS()

      expect(response.status).toBe(204)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    })
  })
})