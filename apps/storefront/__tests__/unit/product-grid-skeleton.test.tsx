import { render } from '@testing-library/react'
import ProductGridSkeleton from '@/components/product/product-grid-skeleton'

describe('ProductGridSkeleton', () => {
  it('renders 8 skeleton cards', () => {
    const { container } = render(<ProductGridSkeleton />)
    const cards = container.querySelectorAll('[data-testid="skeleton-card"]')
    expect(cards).toHaveLength(8)
  })

  it('skeleton cards have animate-pulse class', () => {
    const { container } = render(<ProductGridSkeleton />)
    const cards = container.querySelectorAll('[data-testid="skeleton-card"]')
    cards.forEach((card) => {
      expect(card.className).toContain('animate-pulse')
    })
  })
})
