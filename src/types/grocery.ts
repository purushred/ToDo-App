export interface GroceryItem {
  id: string
  name: string
  checked: boolean
  createdAt: number
  updatedAt: number
}

export interface GroceryList {
  items: GroceryItem[]
}