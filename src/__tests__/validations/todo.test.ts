/**
 * Tests for Todo Validation Schemas
 */

import {
  todoTitleSchema,
  todoDescriptionSchema,
  todoCompletedSchema,
  createTodoSchema,
  updateTodoSchema,
  replaceTodoSchema,
  todoIdSchema,
  todoListQuerySchema,
} from '@/lib/validations/todo'

describe('Todo Validation Schemas', () => {
  describe('todoTitleSchema', () => {
    it('should accept valid titles', () => {
      expect(todoTitleSchema.parse('Buy groceries')).toBe('Buy groceries')
      expect(todoTitleSchema.parse('  Trimmed title  ')).toBe('Trimmed title')
      expect(todoTitleSchema.parse('a')).toBe('a')
      expect(todoTitleSchema.parse('a'.repeat(200))).toBe('a'.repeat(200))
    })

    it('should reject empty titles', () => {
      expect(() => todoTitleSchema.parse('')).toThrow()
      expect(() => todoTitleSchema.parse('   ')).toThrow()
    })

    it('should reject titles over 200 characters', () => {
      expect(() => todoTitleSchema.parse('a'.repeat(201))).toThrow()
    })

    it('should reject non-string values', () => {
      expect(() => todoTitleSchema.parse(123)).toThrow()
      expect(() => todoTitleSchema.parse(null)).toThrow()
      expect(() => todoTitleSchema.parse(undefined)).toThrow()
    })
  })

  describe('todoDescriptionSchema', () => {
    it('should accept valid descriptions', () => {
      expect(todoDescriptionSchema.parse('Valid description')).toBe('Valid description')
      expect(todoDescriptionSchema.parse('  Trimmed  ')).toBe('Trimmed')
      expect(todoDescriptionSchema.parse('a'.repeat(5000))).toBe('a'.repeat(5000))
    })

    it('should accept null and undefined', () => {
      expect(todoDescriptionSchema.parse(null)).toBeNull()
      expect(todoDescriptionSchema.parse(undefined)).toBeUndefined()
    })

    it('should reject descriptions over 5000 characters', () => {
      expect(() => todoDescriptionSchema.parse('a'.repeat(5001))).toThrow()
    })

    it('should reject non-string values when not null', () => {
      expect(() => todoDescriptionSchema.parse(123)).toThrow()
      expect(() => todoDescriptionSchema.parse([])).toThrow()
    })
  })

  describe('todoCompletedSchema', () => {
    it('should accept boolean values', () => {
      expect(todoCompletedSchema.parse(true)).toBe(true)
      expect(todoCompletedSchema.parse(false)).toBe(false)
    })

    it('should accept undefined', () => {
      expect(todoCompletedSchema.parse(undefined)).toBeUndefined()
    })

    it('should reject non-boolean values', () => {
      expect(() => todoCompletedSchema.parse('true')).toThrow()
      expect(() => todoCompletedSchema.parse(1)).toThrow()
      expect(() => todoCompletedSchema.parse(null)).toThrow()
    })
  })

  describe('createTodoSchema', () => {
    it('should accept valid create requests', () => {
      const result = createTodoSchema.parse({
        title: 'Buy groceries',
        description: 'Get milk and eggs',
      })
      expect(result).toEqual({
        title: 'Buy groceries',
        description: 'Get milk and eggs',
      })
    })

    it('should accept create requests with only title', () => {
      const result = createTodoSchema.parse({ title: 'Buy groceries' })
      expect(result).toEqual({
        title: 'Buy groceries',
        description: undefined,
      })
    })

    it('should reject create requests without title', () => {
      expect(() => createTodoSchema.parse({ description: 'No title' })).toThrow()
      expect(() => createTodoSchema.parse({})).toThrow()
    })

    it('should trim and validate title', () => {
      const result = createTodoSchema.parse({ title: '  Trimmed  ' })
      expect(result.title).toBe('Trimmed')
    })
  })

  describe('updateTodoSchema', () => {
    it('should accept partial updates', () => {
      expect(updateTodoSchema.parse({ title: 'New title' })).toEqual({
        title: 'New title',
        description: undefined,
        completed: undefined,
      })
      
      expect(updateTodoSchema.parse({ completed: true })).toEqual({
        title: undefined,
        description: undefined,
        completed: true,
      })
      
      expect(updateTodoSchema.parse({ description: null })).toEqual({
        title: undefined,
        description: null,
        completed: undefined,
      })
    })

    it('should accept empty objects', () => {
      expect(updateTodoSchema.parse({})).toEqual({
        title: undefined,
        description: undefined,
        completed: undefined,
      })
    })

    it('should reject invalid field values', () => {
      expect(() => updateTodoSchema.parse({ title: '' })).toThrow()
      expect(() => updateTodoSchema.parse({ completed: 'yes' })).toThrow()
    })
  })

  describe('replaceTodoSchema', () => {
    it('should accept valid full updates', () => {
      const result = replaceTodoSchema.parse({
        title: 'New title',
        description: 'New description',
        completed: true,
      })
      expect(result).toEqual({
        title: 'New title',
        description: 'New description',
        completed: true,
      })
    })

    it('should default completed to false', () => {
      const result = replaceTodoSchema.parse({
        title: 'New title',
        description: null,
      })
      expect(result.completed).toBe(false)
    })

    it('should require title', () => {
      expect(() => replaceTodoSchema.parse({ description: 'No title' })).toThrow()
    })

    it('should reject invalid values', () => {
      expect(() => replaceTodoSchema.parse({ title: '' })).toThrow()
      expect(() => replaceTodoSchema.parse({ title: 'Valid', completed: 'yes' })).toThrow()
    })
  })

  describe('todoIdSchema', () => {
    it('should accept valid UUIDs', () => {
      expect(todoIdSchema.parse('123e4567-e89b-12d3-a456-426614174000')).toBe(
        '123e4567-e89b-12d3-a456-426614174000'
      )
    })

    it('should reject invalid UUIDs', () => {
      expect(() => todoIdSchema.parse('not-a-uuid')).toThrow()
      expect(() => todoIdSchema.parse('123')).toThrow()
      expect(() => todoIdSchema.parse('')).toThrow()
    })

    it('should reject non-string values', () => {
      expect(() => todoIdSchema.parse(123)).toThrow()
      expect(() => todoIdSchema.parse(null)).toThrow()
    })
  })

  describe('todoListQuerySchema', () => {
    it('should accept valid query parameters', () => {
      const result = todoListQuerySchema.parse({
        cursor: '123e4567-e89b-12d3-a456-426614174000',
        limit: '50',
      })
      expect(result).toEqual({
        cursor: '123e4567-e89b-12d3-a456-426614174000',
        limit: 50,
      })
    })

    it('should apply default limit', () => {
      const result = todoListQuerySchema.parse({})
      expect(result.limit).toBe(100)
    })

    it('should coerce limit from string to number', () => {
      const result = todoListQuerySchema.parse({ limit: '25' })
      expect(result.limit).toBe(25)
    })

    it('should reject invalid limits', () => {
      expect(() => todoListQuerySchema.parse({ limit: '0' })).toThrow()
      expect(() => todoListQuerySchema.parse({ limit: '101' })).toThrow()
      expect(() => todoListQuerySchema.parse({ limit: '-1' })).toThrow()
    })

    it('should reject invalid cursor format', () => {
      expect(() => todoListQuerySchema.parse({ cursor: 'not-a-uuid' })).toThrow()
    })
  })
})