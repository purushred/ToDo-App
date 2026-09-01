import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GroceryList from '@/components/GroceryList'

describe('GroceryList', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('empty state', () => {
    it('should display empty state when list is empty', () => {
      render(<GroceryList />)

      expect(screen.getByText('Your grocery list is empty')).toBeInTheDocument()
      expect(screen.getByText('Add some items to get started!')).toBeInTheDocument()
    })

    it('should not display item count when list is empty', () => {
      render(<GroceryList />)

      expect(screen.queryByText(/items checked/)).not.toBeInTheDocument()
    })
  })

  describe('adding items', () => {
    it('should add item to the list', async () => {
      render(<GroceryList />)

      const input = screen.getByPlaceholderText('Add a new item...')
      const submitButton = screen.getByRole('button', { name: 'Add item to list' })
      
      await act(async () => {
        await userEvent.type(input, 'Milk')
        await userEvent.click(submitButton)
      })

      expect(screen.getByText('Milk')).toBeInTheDocument()
      await waitFor(() => {
        expect(screen.getByText('0 of 1 items checked')).toBeInTheDocument()
      })
    })

    it('should add multiple items', async () => {
      render(<GroceryList />)

      const input = screen.getByPlaceholderText('Add a new item...')
      const submitButton = screen.getByRole('button', { name: 'Add item to list' })
      
      await act(async () => {
        await userEvent.type(input, 'Milk')
        await userEvent.click(submitButton)
      })

      await act(async () => {
        await userEvent.type(input, 'Bread')
        await userEvent.click(submitButton)
      })

      await act(async () => {
        await userEvent.type(input, 'Eggs')
        await userEvent.click(submitButton)
      })

      expect(screen.getByText('Milk')).toBeInTheDocument()
      expect(screen.getByText('Bread')).toBeInTheDocument()
      expect(screen.getByText('Eggs')).toBeInTheDocument()
      await waitFor(() => {
        expect(screen.getByText('0 of 3 items checked')).toBeInTheDocument()
      })
    })
  })

  describe('checking items', () => {
    it('should toggle item checked state', async () => {
      render(<GroceryList />)

      const input = screen.getByPlaceholderText('Add a new item...')
      const submitButton = screen.getByRole('button', { name: 'Add item to list' })
      
      await act(async () => {
        await userEvent.type(input, 'Milk')
        await userEvent.click(submitButton)
      })

      const checkbox = screen.getByRole('checkbox', { name: /Milk/ })
      await act(async () => {
        await userEvent.click(checkbox)
      })

      await waitFor(() => {
        expect(checkbox).toBeChecked()
      })
      await waitFor(() => {
        expect(screen.getByText('1 of 1 items checked')).toBeInTheDocument()
      })
      expect(screen.getByText('Milk')).toHaveClass('line-through')
    })

    it('should update item count when items are checked', async () => {
      render(<GroceryList />)

      const input = screen.getByPlaceholderText('Add a new item...')
      const submitButton = screen.getByRole('button', { name: 'Add item to list' })
      
      await act(async () => {
        await userEvent.type(input, 'Milk')
        await userEvent.click(submitButton)
      })

      await act(async () => {
        await userEvent.type(input, 'Bread')
        await userEvent.click(submitButton)
      })

      const checkboxes = screen.getAllByRole('checkbox')
      const milkCheckbox = checkboxes[0]
      
      await act(async () => {
        await userEvent.click(milkCheckbox)
      })

      await waitFor(() => {
        expect(screen.getByText('1 of 2 items checked')).toBeInTheDocument()
      })
    })
  })

  describe('deleting items', () => {
    it('should remove item from list', async () => {
      render(<GroceryList />)

      const input = screen.getByPlaceholderText('Add a new item...')
      const submitButton = screen.getByRole('button', { name: 'Add item to list' })
      
      await act(async () => {
        await userEvent.type(input, 'Milk')
        await userEvent.click(submitButton)
      })

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Delete Milk' }))
      })

      await waitFor(() => {
        expect(screen.getByText('Your grocery list is empty')).toBeInTheDocument()
      })
    })
  })

  describe('editing items', () => {
    it('should edit item name', async () => {
      render(<GroceryList />)

      const input = screen.getByPlaceholderText('Add a new item...')
      const submitButton = screen.getByRole('button', { name: 'Add item to list' })
      
      await act(async () => {
        await userEvent.type(input, 'Milk')
        await userEvent.click(submitButton)
      })

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Edit Milk' }))
      })

      const editInput = screen.getByLabelText('Edit item name')
      await act(async () => {
        await userEvent.clear(editInput)
        await userEvent.type(editInput, 'Almond Milk')
        await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
      })

      await waitFor(() => {
        expect(screen.getByText('Almond Milk')).toBeInTheDocument()
      })
    })
  })

  describe('clear checked items', () => {
    it('should show clear checked button when items are checked', async () => {
      render(<GroceryList />)

      const input = screen.getByPlaceholderText('Add a new item...')
      const submitButton = screen.getByRole('button', { name: 'Add item to list' })
      
      await act(async () => {
        await userEvent.type(input, 'Milk')
        await userEvent.click(submitButton)
      })

      await act(async () => {
        await userEvent.type(input, 'Bread')
        await userEvent.click(submitButton)
      })

      const checkboxes = screen.getAllByRole('checkbox')
      await act(async () => {
        await userEvent.click(checkboxes[0])
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Clear all checked items' })).toBeInTheDocument()
      })
    })

    it('should not show clear checked button when no items are checked', async () => {
      render(<GroceryList />)

      const input = screen.getByPlaceholderText('Add a new item...')
      const submitButton = screen.getByRole('button', { name: 'Add item to list' })
      
      await act(async () => {
        await userEvent.type(input, 'Milk')
        await userEvent.click(submitButton)
      })

      expect(screen.queryByRole('button', { name: 'Clear all checked items' })).not.toBeInTheDocument()
    })

    it('should remove all checked items when clicked', async () => {
      render(<GroceryList />)

      const input = screen.getByPlaceholderText('Add a new item...')
      const submitButton = screen.getByRole('button', { name: 'Add item to list' })
      
      await act(async () => {
        await userEvent.type(input, 'Milk')
        await userEvent.click(submitButton)
      })

      await act(async () => {
        await userEvent.type(input, 'Bread')
        await userEvent.click(submitButton)
      })

      await act(async () => {
        await userEvent.type(input, 'Eggs')
        await userEvent.click(submitButton)
      })

      const checkboxes = screen.getAllByRole('checkbox')
      
      await act(async () => {
        await userEvent.click(checkboxes[0])
      })

      await act(async () => {
        await userEvent.click(checkboxes[1])
      })

      await waitFor(async () => {
        const clearButton = screen.getByRole('button', { name: 'Clear all checked items' })
        await userEvent.click(clearButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Eggs')).toBeInTheDocument()
        expect(screen.queryByText('Milk')).not.toBeInTheDocument()
        expect(screen.queryByText('Bread')).not.toBeInTheDocument()
      })
    })
  })

  describe('persistence', () => {
    it('should persist items across renders', async () => {
      const { unmount } = render(<GroceryList />)

      const input = screen.getByPlaceholderText('Add a new item...')
      const submitButton = screen.getByRole('button', { name: 'Add item to list' })
      
      await act(async () => {
        await userEvent.type(input, 'Milk')
        await userEvent.click(submitButton)
      })

      unmount()

      // Re-render
      render(<GroceryList />)

      expect(screen.getByText('Milk')).toBeInTheDocument()
    })
  })
})