import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GroceryItemComponent from '@/components/GroceryItem'
import { GroceryItem } from '@/types/grocery'

describe('GroceryItemComponent', () => {
  const mockItem: GroceryItem = {
    id: 'test-id',
    name: 'Milk',
    checked: false,
    createdAt: 1000,
    updatedAt: 1000,
  }

  const mockOnToggle = jest.fn()
  const mockOnDelete = jest.fn()
  const mockOnUpdate = jest.fn()

  beforeEach(() => {
    mockOnToggle.mockClear()
    mockOnDelete.mockClear()
    mockOnUpdate.mockClear()
  })

  describe('display mode', () => {
    it('should render item name', () => {
      render(
        <GroceryItemComponent
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      expect(screen.getByText('Milk')).toBeInTheDocument()
    })

    it('should render unchecked checkbox for unchecked item', () => {
      render(
        <GroceryItemComponent
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('should render checked checkbox for checked item', () => {
      const checkedItem = { ...mockItem, checked: true }
      render(
        <GroceryItemComponent
          item={checkedItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('should apply strikethrough styling to checked items', () => {
      const checkedItem = { ...mockItem, checked: true }
      render(
        <GroceryItemComponent
          item={checkedItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      const itemText = screen.getByText('Milk')
      expect(itemText).toHaveClass('line-through')
    })

    it('should not apply strikethrough to unchecked items', () => {
      render(
        <GroceryItemComponent
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      const itemText = screen.getByText('Milk')
      expect(itemText).not.toHaveClass('line-through')
    })

    it('should call onToggle when checkbox is clicked', async () => {
      render(
        <GroceryItemComponent
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      await act(async () => {
        await userEvent.click(screen.getByRole('checkbox'))
      })

      expect(mockOnToggle).toHaveBeenCalledWith('test-id')
    })

    it('should call onDelete when delete button is clicked', async () => {
      render(
        <GroceryItemComponent
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Delete Milk' }))
      })

      expect(mockOnDelete).toHaveBeenCalledWith('test-id')
    })

    it('should have accessible labels', () => {
      render(
        <GroceryItemComponent
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      expect(screen.getByLabelText('Check Milk')).toBeInTheDocument()
      expect(screen.getByLabelText('Edit Milk')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete Milk')).toBeInTheDocument()
    })
  })

  describe('edit mode', () => {
    it('should enter edit mode when edit button is clicked', async () => {
      render(
        <GroceryItemComponent
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Edit Milk' }))
      })

      expect(screen.getByLabelText('Edit item name')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel editing' })).toBeInTheDocument()
    })

    it('should pre-fill input with current item name in edit mode', async () => {
      render(
        <GroceryItemComponent
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Edit Milk' }))
      })

      const input = screen.getByLabelText('Edit item name') as HTMLInputElement
      expect(input.value).toBe('Milk')
    })

    it('should call onUpdate with trimmed value when saved', async () => {
      render(
        <GroceryItemComponent
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Edit Milk' }))
      })

      const input = screen.getByLabelText('Edit item name')
      await act(async () => {
        await userEvent.clear(input)
        await userEvent.type(input, 'Almond Milk')
        await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
      })

      expect(mockOnUpdate).toHaveBeenCalledWith('test-id', 'Almond Milk')
    })

    it('should exit edit mode after saving', async () => {
      render(
        <GroceryItemComponent
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Edit Milk' }))
      })

      const input = screen.getByLabelText('Edit item name')
      await act(async () => {
        await userEvent.clear(input)
        await userEvent.type(input, 'Almond Milk')
        await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
      })

      expect(mockOnUpdate).toHaveBeenCalled()
    })

    it('should cancel editing and restore original value', async () => {
      render(
        <GroceryItemComponent
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Edit Milk' }))
      })

      const input = screen.getByLabelText('Edit item name')
      await act(async () => {
        await userEvent.clear(input)
        await userEvent.type(input, 'Changed')
        await userEvent.click(screen.getByRole('button', { name: 'Cancel editing' }))
      })

      expect(screen.getByText('Milk')).toBeInTheDocument()
      expect(mockOnUpdate).not.toHaveBeenCalled()
    })

    it('should cancel editing when Escape key is pressed', async () => {
      render(
        <GroceryItemComponent
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Edit Milk' }))
      })

      const input = screen.getByLabelText('Edit item name')
      await act(async () => {
        await userEvent.clear(input)
        await userEvent.type(input, 'Changed')
        await userEvent.keyboard('{Escape}')
      })

      await waitFor(() => {
        expect(screen.getByText('Milk')).toBeInTheDocument()
      })
      expect(mockOnUpdate).not.toHaveBeenCalled()
    })

    it('should not save when input is empty or whitespace only', async () => {
      render(
        <GroceryItemComponent
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      )

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Edit Milk' }))
      })

      const input = screen.getByLabelText('Edit item name')
      await act(async () => {
        await userEvent.clear(input)
        await userEvent.type(input, '   ')
        await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
      })

      expect(mockOnUpdate).not.toHaveBeenCalled()
    })
  })
})