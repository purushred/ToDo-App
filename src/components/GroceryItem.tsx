'use client'

import { useState, FormEvent } from 'react'
import { GroceryItem as GroceryItemType } from '@/types/grocery'

interface GroceryItemProps {
  item: GroceryItemType
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, name: string) => void
}

export default function GroceryItemComponent({
  item,
  onToggle,
  onDelete,
  onUpdate,
}: GroceryItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(item.name)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmedValue = editValue.trim()
    if (trimmedValue) {
      onUpdate(item.id, trimmedValue)
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditValue(item.name)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <li className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            aria-label="Edit item name"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Save changes"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditValue(item.name)
              setIsEditing(false)
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Cancel editing"
          >
            Cancel
          </button>
        </form>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3 p-4 bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => onToggle(item.id)}
        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label={item.checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
      />
      <span
        className={`flex-1 text-gray-900 ${
          item.checked ? 'line-through text-gray-500' : ''
        }`}
      >
        {item.name}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        aria-label={`Edit ${item.name}`}
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(item.id)}
        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
        aria-label={`Delete ${item.name}`}
      >
        Delete
      </button>
    </li>
  )
}