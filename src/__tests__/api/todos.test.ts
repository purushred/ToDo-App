import { NextRequest } from 'next/server'
import { GET, POST, OPTIONS } from '@/app/api/todos/route'
import * as todoService from '@/lib/todoService'

// Mock the todoService module
jest.mock('@/lib/todoService')

// Mock NextRequest
function createRequest(body?: any): NextRequest {
  return {
    json: async () => body,
    url: 'http://localhost:3000/api/todos',
  } as NextRequest
}

describe('/api/todos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 200 status', async () => {
      ;(todoService.getAllTodos as jest.Mock).mockResolvedValue({
        todos: [],
        nextCursor: undefined,
      })
      ;(todoService.getTodoCount as jest.Mock).mockResolvedValue(0)

      const response = await GET(createRequest())
      expect(response.status).toBe(200)
    })

    it('should include CORS headers', async () => {
      ;(todoService.getAllTodos as jest.Mock).mockResolvedValue({
        todos: [],
        nextCursor: undefined,
      })
      ;(todoService.getTodoCount as jest.Mock).mockResolvedValue(0)

      const response = await GET(createRequest())

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    })

    it('should return todos from database', async () => {
      const mockTodos = [
        {
          id: 'todo-1',
          title: 'Test Todo',
          description: 'Description',
          completed: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ]

      ;(todoService.getAllTodos as jest.Mock).mockResolvedValue({
        todos: mockTodos,
        nextCursor: undefined,
      })
      ;(todoService.getTodoCount as jest.Mock).mockResolvedValue(1)

      const response = await GET(createRequest())
      const data = await response.json()

      expect(data.data).toHaveLength(1)
      expect(data.data[0].title).toBe('Test Todo')
    })

    it('should return 503 on database connection error', async () => {
      const error = new Error('connection pool exhausted')
      ;(todoService.getAllTodos as jest.Mock).mockRejectedValue(error)

      const response = await GET(createRequest())

      expect(response.status).toBe(503)
    })
  })

  describe('POST', () => {
    it('should return 201 for valid todo', async () => {
      const mockTodo = {
        id: 'todo-1',
        title: 'New Todo',
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;(todoService.createTodo as jest.Mock).mockResolvedValue(mockTodo)

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
      const mockTodo = {
        id: 'todo-1',
        title: 'a'.repeat(200),
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;(todoService.createTodo as jest.Mock).mockResolvedValue(mockTodo)

      const request = createRequest({ title: 'a'.repeat(200) })
      const response = await POST(request)

      expect(response.status).toBe(201)
    })

    it('should accept description at exactly 5000 characters', async () => {
      const mockTodo = {
        id: 'todo-1',
        title: 'Valid',
        description: 'a'.repeat(5000),
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;(todoService.createTodo as jest.Mock).mockResolvedValue(mockTodo)

      const request = createRequest({
        title: 'Valid',
        description: 'a'.repeat(5000)
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
    })

    it('should handle special characters in title', async () => {
      const mockTodo = {
        id: 'todo-1',
        title: 'Test <>&"\'🚀',
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;(todoService.createTodo as jest.Mock).mockResolvedValue(mockTodo)

      const request = createRequest({ title: 'Test <>&"\'🚀' })
      const response = await POST(request)

      expect(response.status).toBe(201)
    })

    it('should include CORS headers', async () => {
      const mockTodo = {
        id: 'todo-1',
        title: 'Test',
        description: undefined,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;(todoService.createTodo as jest.Mock).mockResolvedValue(mockTodo)

      const request = createRequest({ title: 'Test' })
      const response = await POST(request)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('should return 503 on database connection error', async () => {
      const error = new Error('connection pool exhausted')
      ;(todoService.createTodo as jest.Mock).mockRejectedValue(error)

      const request = createRequest({ title: 'Test' })
      const response = await POST(request)

      expect(response.status).toBe(503)
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