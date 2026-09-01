import { NextRequest } from 'next/server'
import { GET, PUT, PATCH, DELETE, OPTIONS } from '@/app/api/todos/[id]/route'
import { todoStore } from '@/lib/todoStore'

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
    todoStore.clear()
  })

  describe('GET', () => {
    it('should return 200 for existing todo', async () => {
      const todo = todoStore.create('Test')
      const response = await GET(createRequest(), createRouteParams(todo.id))
      
      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent todo', async () => {
      const response = await GET(createRequest(), createRouteParams('non-existent'))
      
      expect(response.status).toBe(404)
    })

    it('should include CORS headers', async () => {
      const todo = todoStore.create('Test')
      const response = await GET(createRequest(), createRouteParams(todo.id))
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })
  })

  describe('PUT', () => {
    it('should return 200 for valid update', async () => {
      const todo = todoStore.create('Test')
      const request = createRequest({ title: 'Updated', completed: true })
      const response = await PUT(request, createRouteParams(todo.id))
      
      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent todo', async () => {
      const request = createRequest({ title: 'Updated' })
      const response = await PUT(request, createRouteParams('non-existent'))
      
      expect(response.status).toBe(404)
    })

    it('should return 400 for missing title', async () => {
      const todo = todoStore.create('Test')
      const request = createRequest({ completed: true })
      const response = await PUT(request, createRouteParams(todo.id))
      
      expect(response.status).toBe(400)
    })

    it('should return 400 for title exceeding 200 characters', async () => {
      const todo = todoStore.create('Test')
      const request = createRequest({ title: 'a'.repeat(201) })
      const response = await PUT(request, createRouteParams(todo.id))
      
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid completed type', async () => {
      const todo = todoStore.create('Test')
      const request = createRequest({ title: 'Valid', completed: 'yes' as any })
      const response = await PUT(request, createRouteParams(todo.id))
      
      expect(response.status).toBe(400)
    })
  })

  describe('PATCH', () => {
    it('should return 200 for valid partial update', async () => {
      const todo = todoStore.create('Test')
      const request = createRequest({ completed: true })
      const response = await PATCH(request, createRouteParams(todo.id))
      
      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent todo', async () => {
      const request = createRequest({ title: 'Updated' })
      const response = await PATCH(request, createRouteParams('non-existent'))
      
      expect(response.status).toBe(404)
    })

    it('should return 400 for no update fields', async () => {
      const todo = todoStore.create('Test')
      const request = createRequest({})
      const response = await PATCH(request, createRouteParams(todo.id))
      
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid title type', async () => {
      const todo = todoStore.create('Test')
      const request = createRequest({ title: 123 as any })
      const response = await PATCH(request, createRouteParams(todo.id))
      
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid description type', async () => {
      const todo = todoStore.create('Test')
      const request = createRequest({ description: 123 as any })
      const response = await PATCH(request, createRouteParams(todo.id))
      
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid completed type', async () => {
      const todo = todoStore.create('Test')
      const request = createRequest({ completed: 'yes' as any })
      const response = await PATCH(request, createRouteParams(todo.id))
      
      expect(response.status).toBe(400)
    })
  })

  describe('DELETE', () => {
    it('should return 200 for existing todo', async () => {
      const todo = todoStore.create('Test')
      const response = await DELETE(createRequest(), createRouteParams(todo.id))
      
      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent todo', async () => {
      const response = await DELETE(createRequest(), createRouteParams('non-existent'))
      
      expect(response.status).toBe(404)
    })

    it('should include CORS headers', async () => {
      const todo = todoStore.create('Test')
      const response = await DELETE(createRequest(), createRouteParams(todo.id))
      
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