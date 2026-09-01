import { NextRequest } from 'next/server'
import { GET, POST, OPTIONS } from '@/app/api/todos/route'

// Mock NextRequest
function createRequest(body?: any): NextRequest {
  return {
    json: async () => body,
  } as NextRequest
}

describe('/api/todos', () => {
  describe('GET', () => {
    it('should return 200 status', async () => {
      const response = await GET(createRequest())
      expect(response.status).toBe(200)
    })

    it('should include CORS headers', async () => {
      const response = await GET(createRequest())
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    })
  })

  describe('POST', () => {
    it('should return 201 for valid todo', async () => {
      const request = createRequest({ title: 'New Todo' })
      const response = await POST(request)
      
      expect(response.status).toBe(201)
    })

    it('should return 400 for missing title', async () => {
      const request = createRequest({})
      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })

    it('should return 400 for empty title', async () => {
      const request = createRequest({ title: '' })
      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })

    it('should return 400 for whitespace-only title', async () => {
      const request = createRequest({ title: '   ' })
      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })

    it('should return 400 for title exceeding 200 characters', async () => {
      const request = createRequest({ title: 'a'.repeat(201) })
      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })

    it('should return 400 for description exceeding 5000 characters', async () => {
      const request = createRequest({ 
        title: 'Valid', 
        description: 'a'.repeat(5001) 
      })
      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })

    it('should return 400 for non-string title', async () => {
      const request = createRequest({ title: 123 })
      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })

    it('should return 400 for non-string description', async () => {
      const request = createRequest({ title: 'Valid', description: 123 })
      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })

    it('should accept title at exactly 200 characters', async () => {
      const request = createRequest({ title: 'a'.repeat(200) })
      const response = await POST(request)
      
      expect(response.status).toBe(201)
    })

    it('should accept description at exactly 5000 characters', async () => {
      const request = createRequest({ 
        title: 'Valid', 
        description: 'a'.repeat(5000) 
      })
      const response = await POST(request)
      
      expect(response.status).toBe(201)
    })

    it('should handle special characters in title', async () => {
      const request = createRequest({ title: 'Test <>&"\'🚀' })
      const response = await POST(request)
      
      expect(response.status).toBe(201)
    })

    it('should include CORS headers', async () => {
      const request = createRequest({ title: 'Test' })
      const response = await POST(request)
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })
  })

  describe('OPTIONS', () => {
    it('should return 204 with CORS headers', async () => {
      const response = await OPTIONS()

      expect(response.status).toBe(204)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })
  })
})