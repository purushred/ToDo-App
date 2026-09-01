import { Todo } from '@/types/todo'
import { generateUUID } from '@/utils/generateUUID'

/**
 * In-memory store for todos
 * Note: Data will be lost on server restart
 */
class TodoStore {
  private todos: Map<string, Todo> = new Map()

  create(title: string, description?: string): Todo {
    const now = new Date().toISOString()
    const todo: Todo = {
      id: generateUUID(),
      title: title.trim(),
      description: description?.trim() || undefined,
      completed: false,
      createdAt: now,
      updatedAt: now,
    }
    this.todos.set(todo.id, todo)
    return todo
  }

  getAll(): Todo[] {
    return Array.from(this.todos.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  getById(id: string): Todo | null {
    return this.todos.get(id) || null
  }

  update(id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>): Todo | null {
    const existing = this.todos.get(id)
    if (!existing) return null

    const updated: Todo = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    if (updates.title !== undefined) {
      updated.title = updates.title.trim()
    }
    if (updates.description !== undefined) {
      updated.description = updates.description?.trim() || undefined
    }

    this.todos.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.todos.delete(id)
  }

  clear(): void {
    this.todos.clear()
  }
}

// Singleton instance
export const todoStore = new TodoStore()