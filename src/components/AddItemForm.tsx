'use client'

import { useState, FormEvent } from 'react'

interface AddItemFormProps {
  onAddItem: (name: string) => void
}

export default function AddItemForm({ onAddItem }: AddItemFormProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onAddItem(value.trim())
      setValue('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a new item..."
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="New item name"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Add item to list"
      >
        Add Item
      </button>
    </form>
  )
}