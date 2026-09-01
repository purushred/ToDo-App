import { createTodo, getAllTodos, getTodoById, updateTodo, deleteTodo, clearAllTodos, getTodoCount } from '@/lib/todoService'
import { prisma } from '@/lib/database'
import { Prisma } from '@prisma/client'

// Mock Prisma client
jest.mock('@/lib/database', () => ({
  prisma: {
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}))

describe('TodoService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createTodo', () => {
    it('should create a todo with title only', async () => {
      const mockTodo = {
        id: 'test-uuid',
        title: 'Test Todo',
        description: null,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.todo.create as jest.Mock).mockResolvedValue(mockTodo)

      const todo = await createTodo('Test Todo')

      expect(todo.id).toBe('test-uuid')
      expect(todo.title).toBe('Test Todo')
      expect(todo.description).toBeUndefined()
      expect(todo.completed).toBe(false)
      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          title: 'Test Todo',
          description: null,
          completed: false,
        },
      })
    })

    it('should create a todo with title and description', async () => {
      const mockTodo = {
        id: 'test-uuid',
        title: 'Test Todo',
        description: 'Description',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.todo.create as jest.Mock).mockResolvedValue(mockTodo)

      const todo = await createTodo('Test Todo', 'Description')

      expect(todo.title).toBe('Test Todo')
      expect(todo.description).toBe('Description')
    })

    it('should trim title and description', async () => {
      const mockTodo = {
        id: 'test-uuid',
        title: 'Test Todo',
        description: 'Description',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.todo.create as jest.Mock).mockResolvedValue(mockTodo)

      await createTodo('  Test Todo  ', '  Description  ')

      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          title: 'Test Todo',
          description: 'Description',
          completed: false,
        },
      })
    })

    it('should set empty description to null', async () => {
      const mockTodo = {
        id: 'test-uuid',
        title: 'Test Todo',
        description: null,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.todo.create as jest.Mock).mockResolvedValue(mockTodo)

      await createTodo('Test Todo', '')

      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          title: 'Test Todo',
          description: null,
          completed: false,
        },
      })
    })
  })

  describe('getAllTodos', () => {
    it('should return empty array when no todos exist', async () => {
      ;(prisma.todo.findMany as jest.Mock).mockResolvedValue([])

      const { todos } = await getAllTodos()

      expect(todos).toEqual([])
    })

    it('should return all todos sorted by creation date', async () => {
      const mockTodos = [
        {
          id: 'todo-3',
          title: 'Third',
          description: null,
          completed: false,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
        },
        {
          id: 'todo-2',
          title: 'Second',
          description: null,
          completed: false,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 'todo-1',
          title: 'First',
          description: null,
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      ;(prisma.todo.findMany as jest.Mock).mockResolvedValue(mockTodos)

      const { todos } = await getAllTodos()

      expect(todos).toHaveLength(3)
      expect(todos[0].id).toBe('todo-3')
      expect(todos[1].id).toBe('todo-2')
      expect(todos[2].id).toBe('todo-1')
    })

    it('should support cursor-based pagination', async () => {
      const mockTodos = [
        {
          id: 'todo-2',
          title: 'Second',
          description: null,
          completed: false,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 'todo-1',
          title: 'First',
          description: null,
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      ;(prisma.todo.findMany as jest.Mock).mockResolvedValue(mockTodos)

      const { todos, nextCursor } = await getAllTodos({ cursor: 'todo-3', limit: 2 })

      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        take: 3,
        orderBy: { createdAt: 'desc' },
        cursor: { id: 'todo-3' },
        skip: 1,
        select: {
          id: true,
          title: true,
          description: true,
          completed: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    })
  })

  describe('getTodoById', () => {
    it('should return todo by id', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test Todo',
        description: null,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.todo.findUnique as jest.Mock).mockResolvedValue(mockTodo)

      const todo = await getTodoById('test-id')

      expect(todo).not.toBeNull()
      expect(todo!.id).toBe('test-id')
      expect(todo!.title).toBe('Test Todo')
    })

    it('should return null for non-existent id', async () => {
      ;(prisma.todo.findUnique as jest.Mock).mockResolvedValue(null)

      const todo = await getTodoById('non-existent-id')

      expect(todo).toBeNull()
    })
  })

  describe('updateTodo', () => {
    it('should update title', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'New Title',
        description: null,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.todo.update as jest.Mock).mockResolvedValue(mockTodo)

      const updated = await updateTodo('test-id', { title: 'New Title' })

      expect(updated).not.toBeNull()
      expect(updated!.title).toBe('New Title')
    })

    it('should update description', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test',
        description: 'New Description',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.todo.update as jest.Mock).mockResolvedValue(mockTodo)

      const updated = await updateTodo('test-id', { description: 'New Description' })

      expect(updated!.description).toBe('New Description')
    })

    it('should update completed', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test',
        description: null,
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.todo.update as jest.Mock).mockResolvedValue(mockTodo)

      const updated = await updateTodo('test-id', { completed: true })

      expect(updated!.completed).toBe(true)
    })

    it('should trim title and description', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'New Title',
        description: 'New Desc',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.todo.update as jest.Mock).mockResolvedValue(mockTodo)

      await updateTodo('test-id', {
        title: '  New Title  ',
        description: '  New Desc  ',
      })

      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          title: 'New Title',
          description: 'New Desc',
          updatedAt: expect.any(Date),
        },
      })
    })

    it('should return null for non-existent id', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '5.22.0' }
      )
      ;(prisma.todo.update as jest.Mock).mockRejectedValue(error)

      const updated = await updateTodo('non-existent', { title: 'New' })

      expect(updated).toBeNull()
    })
  })

  describe('deleteTodo', () => {
    it('should delete existing todo', async () => {
      ;(prisma.todo.delete as jest.Mock).mockResolvedValue({})

      const deleted = await deleteTodo('test-id')

      expect(deleted).toBe(true)
    })

    it('should return false for non-existent id', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '5.22.0' }
      )
      ;(prisma.todo.delete as jest.Mock).mockRejectedValue(error)

      const deleted = await deleteTodo('non-existent')

      expect(deleted).toBe(false)
    })
  })

  describe('clearAllTodos', () => {
    it('should clear all todos', async () => {
      ;(prisma.todo.deleteMany as jest.Mock).mockResolvedValue({ count: 5 })

      await clearAllTodos()

      expect(prisma.todo.deleteMany).toHaveBeenCalled()
    })
  })

  describe('getTodoCount', () => {
    it('should return todo count', async () => {
      ;(prisma.todo.count as jest.Mock).mockResolvedValue(10)

      const count = await getTodoCount()

      expect(count).toBe(10)
    })
  })
})