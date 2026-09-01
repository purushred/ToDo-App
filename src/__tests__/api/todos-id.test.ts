import { NextRequest } from 'next/server'
import { GET, PUT, PATCH, DELETE, OPTIONS } from '@/app/api/todos/[id]/route'
import * as todoService from '@/lib/todoService'

// Mock the todoService module
jest.mock('@/lib/todoService')

// Mock NextRequest
function createRequest(body?: any): NextRequest {
  return {
    json: async () => body,
  } as NextRequest
}

function createRouteParams(id: string) {
  return { params: { id } }
}

describe('/api/todos/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 200 for existing todo', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test',
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;(todoService.getTodoById as jest.Mock).mockResolvedValue(mockTodo)

      const response = await GET(createRequest(), createRouteParams('test-id'))

      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent todo', async () => {
      ;(todoService.getTodoById as jest.Mock).mockResolvedValue(null)

      const response = await GET(createRequest(), createRouteParams('non-existent'))

      expect(response.status).toBe(404)
    })

    it('should include CORS headers', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test',
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;(todoService.getTodoById as jest.Mock).mockResolvedValue(mockTodo)

      const response = await GET(createRequest(), createRouteParams('test-id'))

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('should return 503 on database connection error', async () => {
      const error = new Error('connection pool exhausted')
      ;(todoService.getTodoById as jest.Mock).mockRejectedValue(error)

      const response = await GET(createRequest(), createRouteParams('test-id'))

      expect(response.status).toBe(503)
    })
  })

  describe('PUT', () => {
    it('should return 200 for valid update', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test',
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const updatedTodo = {
        ...mockTodo,
        title: 'Updated',
        completed: true,
      }

      ;(todoService.getTodoById as jest.Mock).mockResolvedValue(mockTodo)
      ;(todoService.updateTodo as jest.Mock).mockResolvedValue(updatedTodo)

      const request = createRequest({ title: 'Updated', completed: true })
      const response = await PUT(request, createRouteParams('test-id'))

      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent todo', async () => {
      ;(todoService.getTodoById as jest.Mock).mockResolvedValue(null)

      const request = createRequest({ title: 'Updated' })
      const response = await PUT(request, createRouteParams('non-existent'))

      expect(response.status).toBe(404)
    })

    it('should return 400 for missing title', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test',
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;(todoService.getTodoById as jest.Mock).mockResolvedValue(mockTodo)

      const request = createRequest({ completed: true })
      const response = await PUT(request, createRouteParams('test-id'))

      expect(response.status).toBe(400)
    })

    it('should return 400 for title exceeding 200 characters', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test',
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;(todoService.getTodoById as jest.Mock).mockResolvedValue(mockTodo)

      const request = createRequest({ title: 'a'.repeat(201) })
      const response = await PUT(request, createRouteParams('test-id'))

      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid completed type', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test',
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;(todoService.getTodoById as jest.Mock).mockResolvedValue(mockTodo)

      const request = createRequest({ title: 'Valid', completed: 'yes' as any })
      const response = await PUT(request, createRouteParams('test-id'))

      expect(response.status).toBe(400)
    })
  })

  describe('PATCH', () => {
    it('should return 200 for valid partial update', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test',
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const updatedTodo = {
        ...mockTodo,
        completed: true,
      }

      ;(todoService.getTodoById as jest.Mock).mockResolvedValue(mockTodo)
      ;(todoService.updateTodo as jest.Mock).mockResolvedValue(updatedTodo)

      const request = createRequest({ completed: true })
      const response = await PATCH(request, createRouteParams('test-id'))

      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent todo', async () => {
      ;(todoService.getTodoById as jest.Mock).mockResolvedValue(null)

      const request = createRequest({ title: 'Updated' })
      const response = await PATCH(request, createRouteParams('non-existent'))

      expect(response.status).toBe(404)
    })

    it('should return 400 for no update fields', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test',
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;(todoService.getTodoById as jest.Mock).mockResolvedValue(mockTodo)

      const request = createRequest({})
      const response = await PATCH(request, createRouteParams('test-id'))

      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid title type', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test',
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;(todoService.getTodoById as jest.Mock).mockResolvedValue(mockTodo)

      const request = createRequest({ title: 123 as any })
      const response = await PATCH(request, createRouteParams('test-id'))

      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid description type', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test',
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;(todoService.getTodoById as jest.Mock).mockResolvedValue(mockTodo)

      const request = createRequest({ description: 123 as any })
      const response = await PATCH(request, createRouteParams('test-id'))

      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid completed type', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test',
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;(todoService.getTodoById as jest.Mock).mockResolvedValue(mockTodo)

      const request = createRequest({ completed: 'yes' as any })
      const response = await PATCH(request, createRouteParams('test-id'))

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE', () => {
    it('should return 200 for existing todo', async () => {
      ;(todoService.deleteTodo as jest.Mock).mockResolvedValue(true)

      const response = await DELETE(createRequest(), createRouteParams('test-id'))

      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent todo', async () => {
      ;(todoService.deleteTodo as jest.Mock).mockResolvedValue(false)

      const response = await DELETE(createRequest(), createRouteParams('non-existent'))

      expect(response.status).toBe(404)
    })

    it('should include CORS headers', async () => {
      ;(todoService.deleteTodo as jest.Mock).mockResolvedValue(true)

      const response = await DELETE(createRequest(), createRouteParams('test-id'))

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })
  })

  describe('OPTIONS', () => {
    it('should return 204 with CORS headers', async () => {
      const response = await OPTIONS()

      expect(response.status).toBe(204)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('PUT')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('PATCH')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('DELETE')
    })
  })
})