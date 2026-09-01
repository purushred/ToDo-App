import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddItemForm from '@/components/AddItemForm'

describe('AddItemForm', () => {
  const mockOnAddItem = jest.fn()

  beforeEach(() => {
    mockOnAddItem.mockClear()
  })

  it('should render input and button', () => {
    render(<AddItemForm onAddItem={mockOnAddItem} />)

    expect(screen.getByPlaceholderText('Add a new item...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add item to list' })).toBeInTheDocument()
  })

  it('should have disabled button when input is empty', () => {
    render(<AddItemForm onAddItem={mockOnAddItem} />)

    const button = screen.getByRole('button', { name: 'Add item to list' })
    expect(button).toBeDisabled()
  })

  it('should enable button when input has text', async () => {
    render(<AddItemForm onAddItem={mockOnAddItem} />)

    const input = screen.getByPlaceholderText('Add a new item...')
    const button = screen.getByRole('button', { name: 'Add item to list' })

    await act(async () => {
      await userEvent.type(input, 'Milk')
    })

    expect(button).not.toBeDisabled()
  })

  it('should call onAddItem with trimmed value on form submit', async () => {
    render(<AddItemForm onAddItem={mockOnAddItem} />)

    const input = screen.getByPlaceholderText('Add a new item...')

    await act(async () => {
      await userEvent.type(input, '  Milk  ')
      await userEvent.click(screen.getByRole('button', { name: 'Add item to list' }))
    })

    expect(mockOnAddItem).toHaveBeenCalledWith('Milk')
  })

  it('should clear input after submit', async () => {
    render(<AddItemForm onAddItem={mockOnAddItem} />)

    const input = screen.getByPlaceholderText('Add a new item...') as HTMLInputElement

    await act(async () => {
      await userEvent.type(input, 'Milk')
      await userEvent.click(screen.getByRole('button', { name: 'Add item to list' }))
    })

    expect(input.value).toBe('')
  })

  it('should not call onAddItem with empty or whitespace-only input', async () => {
    render(<AddItemForm onAddItem={mockOnAddItem} />)

    const input = screen.getByPlaceholderText('Add a new item...')

    await act(async () => {
      await userEvent.type(input, '   ')
    })

    // Button should still be disabled for whitespace-only input
    const button = screen.getByRole('button', { name: 'Add item to list' })
    expect(button).toBeDisabled()
  })

  it('should submit on Enter key', async () => {
    render(<AddItemForm onAddItem={mockOnAddItem} />)

    const input = screen.getByPlaceholderText('Add a new item...')

    await act(async () => {
      await userEvent.type(input, 'Bread{enter}')
    })

    expect(mockOnAddItem).toHaveBeenCalledWith('Bread')
  })

  it('should have accessible labels', () => {
    render(<AddItemForm onAddItem={mockOnAddItem} />)

    expect(screen.getByLabelText('New item name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add item to list' })).toBeInTheDocument()
  })
})