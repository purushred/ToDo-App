import { GET, OPTIONS } from '@/app/api/health/route'

// Mock NextRequest
function createRequest(): any {
  return {}
}

describe('/api/health', () => {
  describe('GET', () => {
    it('should return 200 status', async () => {
      const response = await GET(createRequest())
      expect(response.status).toBe(200)
    })

    it('should include CORS headers', async () => {
      const response = await GET(createRequest())
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type')
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