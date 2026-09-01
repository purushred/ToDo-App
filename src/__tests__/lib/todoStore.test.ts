import { todoStore } from '@/lib/todoStore'

describe('TodoStore', () => {
  beforeEach(() => {
    todoStore.clear()
  })

  describe('create', () => {
    it('should create a todo with title only', () => {
      const todo = todoStore.create('Test Todo')
      
      expect(todo.id).toBeDefined()
      expect(todo.title).toBe('Test Todo')
      expect(todo.description).toBeUndefined()
      expect(todo.completed).toBe(false)
      expect(todo.createdAt).toBeDefined()
      expect(todo.updatedAt).toBeDefined()
    })

    it('should create a todo with title and description', () => {
      const todo = todoStore.create('Test Todo', 'Description')
      
      expect(todo.title).toBe('Test Todo')
      expect(todo.description).toBe('Description')
    })

    it('should trim title and description', () => {
      const todo = todoStore.create('  Test Todo  ', '  Description  ')
      
      expect(todo.title).toBe('Test Todo')
      expect(todo.description).toBe('Description')
    })

    it('should set empty description to undefined', () => {
      const todo = todoStore.create('Test Todo', '')
      
      expect(todo.description).toBeUndefined()
    })

    it('should generate unique IDs', () => {
      const todo1 = todoStore.create('Todo 1')
      const todo2 = todoStore.create('Todo 2')
      
      expect(todo1.id).not.toBe(todo2.id)
    })

    it('should generate valid UUIDs', () => {
      const todo = todoStore.create('Test Todo')
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      
      expect(todo.id).toMatch(uuidRegex)
    })
  })

  describe('getAll', () => {
    it('should return empty array when no todos exist', () => {
      const todos = todoStore.getAll()
      
      expect(todos).toEqual([])
    })

    it('should return all todos', () => {
      todoStore.create('Todo 1')
      todoStore.create('Todo 2')
      todoStore.create('Todo 3')
      
      const todos = todoStore.getAll()
      
      expect(todos).toHaveLength(3)
    })

    it('should return todos sorted by creation date (newest first)', async () => {
      const todo1 = todoStore.create('First Todo')
      await new Promise(resolve => setTimeout(resolve, 10))
      const todo2 = todoStore.create('Second Todo')
      await new Promise(resolve => setTimeout(resolve, 10))
      const todo3 = todoStore.create('Third Todo')
      
      const todos = todoStore.getAll()
      
      expect(todos[0].id).toBe(todo3.id)
      expect(todos[1].id).toBe(todo2.id)
      expect(todos[2].id).toBe(todo1.id)
    })
  })

  describe('getById', () => {
    it('should return todo by id', () => {
      const created = todoStore.create('Test Todo')
      const found = todoStore.getById(created.id)
      
      expect(found).toEqual(created)
    })

    it('should return null for non-existent id', () => {
      const found = todoStore.getById('non-existent-id')
      
      expect(found).toBeNull()
    })
  })

  describe('update', () => {
    it('should update title', () => {
      const todo = todoStore.create('Original Title')
      const updated = todoStore.update(todo.id, { title: 'New Title' })
      
      expect(updated).not.toBeNull()
      expect(updated!.title).toBe('New Title')
      expect(updated!.description).toBeUndefined()
      expect(updated!.completed).toBe(false)
    })

    it('should update description', () => {
      const todo = todoStore.create('Test', 'Original')
      const updated = todoStore.update(todo.id, { description: 'New' })
      
      expect(updated!.description).toBe('New')
    })

    it('should update completed', () => {
      const todo = todoStore.create('Test')
      const updated = todoStore.update(todo.id, { completed: true })
      
      expect(updated!.completed).toBe(true)
    })

    it('should update updatedAt timestamp', async () => {
      const todo = todoStore.create('Test')
      const originalUpdatedAt = todo.updatedAt
      
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const updated = todoStore.update(todo.id, { title: 'Updated' })
      
      expect(new Date(updated!.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      )
    })

    it('should return null for non-existent id', () => {
      const updated = todoStore.update('non-existent', { title: 'New' })
      
      expect(updated).toBeNull()
    })

    it('should trim title and description', () => {
      const todo = todoStore.create('Test')
      const updated = todoStore.update(todo.id, { 
        title: '  New Title  ', 
        description: '  New Desc  ' 
      })
      
      expect(updated!.title).toBe('New Title')
      expect(updated!.description).toBe('New Desc')
    })

    it('should set empty description to undefined', () => {
      const todo = todoStore.create('Test', 'Original')
      const updated = todoStore.update(todo.id, { description: '' })
      
      expect(updated!.description).toBeUndefined()
    })
  })

  describe('delete', () => {
    it('should delete existing todo', () => {
      const todo = todoStore.create('Test')
      const deleted = todoStore.delete(todo.id)
      
      expect(deleted).toBe(true)
      expect(todoStore.getById(todo.id)).toBeNull()
    })

    it('should return false for non-existent id', () => {
      const deleted = todoStore.delete('non-existent')
      
      expect(deleted).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all todos', () => {
      todoStore.create('Todo 1')
      todoStore.create('Todo 2')
      todoStore.create('Todo 3')
      
      todoStore.clear()
      
      expect(todoStore.getAll()).toHaveLength(0)
    })
  })
})