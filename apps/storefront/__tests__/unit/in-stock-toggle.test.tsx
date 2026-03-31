import { render, screen, fireEvent } from '@testing-library/react'
import InStockToggle from '@/components/product/in-stock-toggle'

const mockPush = jest.fn()
let mockParamsStr = ''

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ toString: () => mockParamsStr }),
}))

describe('InStockToggle', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockParamsStr = 'category=spinning'
  })

  it('renders "În stoc" label', () => {
    render(<InStockToggle inStock={false} />)
    expect(screen.getByText('În stoc')).toBeInTheDocument()
  })

  it('sets in_stock=true when toggled on', () => {
    render(<InStockToggle inStock={false} />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('in_stock=true')
    )
  })

  it('removes in_stock when toggled off', () => {
    mockParamsStr = 'category=spinning&in_stock=true'
    render(<InStockToggle inStock={true} />)
    fireEvent.click(screen.getByRole('button'))
    const url = mockPush.mock.calls[0][0] as string
    expect(url).not.toContain('in_stock')
  })

  it('sets aria-pressed=true when inStock is true', () => {
    render(<InStockToggle inStock={true} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('sets aria-pressed=false when inStock is false', () => {
    render(<InStockToggle inStock={false} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('preserves existing params when toggling', () => {
    render(<InStockToggle inStock={false} />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('category=spinning')
    )
  })
})
