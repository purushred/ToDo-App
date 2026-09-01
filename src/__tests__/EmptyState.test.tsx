import { render, screen } from '@testing-library/react'
import EmptyState from '@/components/EmptyState'

describe('EmptyState', () => {
  it('should render empty state message', () => {
    render(<EmptyState />)

    expect(screen.getByText('Your grocery list is empty')).toBeInTheDocument()
    expect(screen.getByText('Add some items to get started!')).toBeInTheDocument()
  })

  it('should display empty list icon', () => {
    render(<EmptyState />)

    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})