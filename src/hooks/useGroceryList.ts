import { useState, useEffect, useCallback } from 'react'
import { GroceryItem } from '@/types/grocery'
import { generateId } from '@/utils/generateId'

const STORAGE_KEY = 'grocery-list-items'

export function useGroceryList() {
  const [items, setItems] = useState<GroceryItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items])

  const addItem = useCallback((name: string): GroceryItem => {
    const newItem: GroceryItem = {
      id: generateId(),
      name: name.trim(),
      checked: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setItems((prev) => [...prev, newItem])
    return newItem
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, checked: !item.checked, updatedAt: Date.now() }
          : item
      )
    )
  }, [])

  const updateItem = useCallback((id: string, name: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, name: name.trim(), updatedAt: Date.now() }
          : item
      )
    )
  }, [])

  const clearChecked = useCallback(() => {
    setItems((prev) => prev.filter((item) => !item.checked))
  }, [])

  return {
    items,
    addItem,
    removeItem,
    toggleItem,
    updateItem,
    clearChecked,
  }
}