'use client'

import { useGroceryList } from '@/hooks/useGroceryList'
import GroceryItemComponent from './GroceryItem'
import AddItemForm from './AddItemForm'
import EmptyState from './EmptyState'

export default function GroceryList() {
  const {
    items,
    addItem,
    removeItem,
    toggleItem,
    updateItem,
    clearChecked,
  } = useGroceryList()

  const checkedCount = items.filter((item) => item.checked).length
  const totalCount = items.length

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Grocery List</h1>
          {totalCount > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {checkedCount} of {totalCount} items checked
            </p>
          )}
        </header>

        <div className="mb-6">
          <AddItemForm onAddItem={addItem} />
        </div>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ul className="bg-white rounded-lg shadow overflow-hidden">
              {items.map((item) => (
                <GroceryItemComponent
                  key={item.id}
                  item={item}
                  onToggle={toggleItem}
                  onDelete={removeItem}
                  onUpdate={updateItem}
                />
              ))}
            </ul>

            {checkedCount > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearChecked}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  aria-label="Clear all checked items"
                >
                  Clear Checked Items ({checkedCount})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}