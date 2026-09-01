import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Smoke Test', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should render the app without crashing', () => {
    render(<Home />)

    expect(screen.getByText('Grocery List')).toBeInTheDocument()
  })

  it('should render the add item form', () => {
    render(<Home />)

    expect(screen.getByPlaceholderText('Add a new item...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add item to list' })).toBeInTheDocument()
  })

  it('should render empty state initially', () => {
    render(<Home />)

    expect(screen.getByText('Your grocery list is empty')).toBeInTheDocument()
  })
})