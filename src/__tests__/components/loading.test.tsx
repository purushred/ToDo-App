/**
 * Tests for Loading Component
 */

import { render, screen } from '@testing-library/react'
import Loading from '@/app/loading'

describe('Loading Component', () => {
  it('should render loading skeleton', () => {
    render(<Loading />)
    
    // Should have skeleton elements
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should render form skeleton', () => {
    render(<Loading />)
    
    // Check for input-like skeleton
    const formSkeleton = document.querySelector('.flex.gap-3')
    expect(formSkeleton).toBeInTheDocument()
  })

  it('should render list items skeleton', () => {
    render(<Loading />)
    
    // Check for list skeleton
    const listSkeleton = document.querySelector('.bg-white.rounded-lg.shadow')
    expect(listSkeleton).toBeInTheDocument()
  })

  it('should have proper layout structure', () => {
    const { container } = render(<Loading />)
    
    // Check for main container
    expect(container.querySelector('.min-h-screen.bg-gray-50')).toBeInTheDocument()
    expect(container.querySelector('.max-w-2xl.mx-auto')).toBeInTheDocument()
  })

  it('should render header skeleton', () => {
    render(<Loading />)
    
    // Check for header area
    const headerSkeletons = document.querySelectorAll('.animate-pulse')
    const headerArea = headerSkeletons[0]?.closest('header')
    expect(headerArea).toBeInTheDocument()
  })

  it('should render 5 list item skeletons', () => {
    render(<Loading />)
    
    // Check for list items
    const listItems = document.querySelectorAll('.flex.items-center.gap-3.p-4')
    expect(listItems).toHaveLength(5)
  })
})