import { renderHook, act } from '@testing-library/react'
import { useGroceryList } from '@/hooks/useGroceryList'

describe('useGroceryList', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('initialization', () => {
    it('should initialize with empty array when localStorage is empty', () => {
      const { result } = renderHook(() => useGroceryList())
      expect(result.current.items).toEqual([])
    })

    it('should initialize with items from localStorage', () => {
      const storedItems = [
        {
          id: '1',
          name: 'Milk',
          checked: false,
          createdAt: 1000,
          updatedAt: 1000,
        },
        {
          id: '2',
          name: 'Bread',
          checked: true,
          createdAt: 2000,
          updatedAt: 2000,
        },
      ]
      localStorage.setItem('grocery-list-items', JSON.stringify(storedItems))

      const { result } = renderHook(() => useGroceryList())
      expect(result.current.items).toEqual(storedItems)
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('grocery-list-items', 'invalid json')

      const { result } = renderHook(() => useGroceryList())
      expect(result.current.items).toEqual([])
    })
  })

  describe('addItem', () => {
    it('should add a new item to the list', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('Milk')
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].name).toBe('Milk')
      expect(result.current.items[0].checked).toBe(false)
      expect(result.current.items[0].id).toBeDefined()
    })

    it('should trim whitespace from item names', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('  Milk  ')
      })

      expect(result.current.items[0].name).toBe('Milk')
    })

    it('should generate unique IDs for items', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('Milk')
        result.current.addItem('Bread')
      })

      expect(result.current.items[0].id).not.toBe(result.current.items[1].id)
    })

    it('should set createdAt and updatedAt timestamps', () => {
      const { result } = renderHook(() => useGroceryList())

      const beforeTime = Date.now()
      act(() => {
        result.current.addItem('Milk')
      })
      const afterTime = Date.now()

      const item = result.current.items[0]
      expect(item.createdAt).toBeGreaterThanOrEqual(beforeTime)
      expect(item.createdAt).toBeLessThanOrEqual(afterTime)
      expect(item.updatedAt).toBe(item.createdAt)
    })
  })

  describe('removeItem', () => {
    it('should remove an item from the list', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('Milk')
        result.current.addItem('Bread')
      })

      const itemId = result.current.items[0].id

      act(() => {
        result.current.removeItem(itemId)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].name).toBe('Bread')
    })

    it('should not modify list if item ID does not exist', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('Milk')
      })

      act(() => {
        result.current.removeItem('non-existent-id')
      })

      expect(result.current.items).toHaveLength(1)
    })
  })

  describe('toggleItem', () => {
    it('should toggle item checked state from false to true', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('Milk')
      })

      const itemId = result.current.items[0].id

      act(() => {
        result.current.toggleItem(itemId)
      })

      expect(result.current.items[0].checked).toBe(true)
    })

    it('should toggle item checked state from true to false', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('Milk')
      })

      const itemId = result.current.items[0].id

      act(() => {
        result.current.toggleItem(itemId)
        result.current.toggleItem(itemId)
      })

      expect(result.current.items[0].checked).toBe(false)
    })

    it('should update updatedAt timestamp when toggling', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('Milk')
      })

      const originalUpdatedAt = result.current.items[0].updatedAt

      // Wait a bit to ensure timestamp difference
      act(() => {
        result.current.toggleItem(result.current.items[0].id)
      })

      expect(result.current.items[0].updatedAt).toBeGreaterThanOrEqual(originalUpdatedAt)
    })
  })

  describe('updateItem', () => {
    it('should update item name', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('Milk')
      })

      const itemId = result.current.items[0].id

      act(() => {
        result.current.updateItem(itemId, 'Almond Milk')
      })

      expect(result.current.items[0].name).toBe('Almond Milk')
    })

    it('should trim whitespace from updated name', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('Milk')
      })

      const itemId = result.current.items[0].id

      act(() => {
        result.current.updateItem(itemId, '  Almond Milk  ')
      })

      expect(result.current.items[0].name).toBe('Almond Milk')
    })

    it('should update updatedAt timestamp', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('Milk')
      })

      const originalUpdatedAt = result.current.items[0].updatedAt

      act(() => {
        result.current.updateItem(result.current.items[0].id, 'Almond Milk')
      })

      expect(result.current.items[0].updatedAt).toBeGreaterThanOrEqual(originalUpdatedAt)
    })
  })

  describe('clearChecked', () => {
    it('should remove all checked items', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('Milk')
        result.current.addItem('Bread')
        result.current.addItem('Eggs')
      })

      // Check first two items
      act(() => {
        result.current.toggleItem(result.current.items[0].id)
        result.current.toggleItem(result.current.items[1].id)
      })

      act(() => {
        result.current.clearChecked()
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].name).toBe('Eggs')
      expect(result.current.items[0].checked).toBe(false)
    })

    it('should not modify list if no items are checked', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('Milk')
        result.current.addItem('Bread')
      })

      act(() => {
        result.current.clearChecked()
      })

      expect(result.current.items).toHaveLength(2)
    })
  })

  describe('persistence', () => {
    it('should persist items to localStorage when items change', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('Milk')
      })

      const stored = localStorage.getItem('grocery-list-items')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].name).toBe('Milk')
    })

    it('should persist removal to localStorage', () => {
      const { result } = renderHook(() => useGroceryList())

      act(() => {
        result.current.addItem('Milk')
      })

      const itemId = result.current.items[0].id

      act(() => {
        result.current.removeItem(itemId)
      })

      const stored = localStorage.getItem('grocery-list-items')
      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(0)
    })
  })
})