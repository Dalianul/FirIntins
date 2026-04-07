import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PriceFilter } from '@/components/product/price-filter'

const mockPush = jest.fn()
let mockParamsStr = ''

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ toString: () => mockParamsStr }),
}))

// Mock shadcn Input to a plain <input>
jest.mock('@/components/ui/input', () => ({
  Input: ({ className: _c, ...props }: any) => <input {...props} />,
}))

// Mock shadcn Button to a plain <button>
jest.mock('@/components/ui/button', () => ({
  Button: ({ className: _c, size: _s, onClick, children }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}))

describe('PriceFilter', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockParamsStr = ''
  })

  it('renders min and max inputs', () => {
    render(<PriceFilter priceMin="" priceMax="" />)
    expect(screen.getByPlaceholderText('Preț min')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Preț max')).toBeInTheDocument()
  })

  it('renders 4 stepper buttons (−/+ for each input)', () => {
    render(<PriceFilter priceMin="" priceMax="" />)
    const buttons = screen.getAllByRole('button').filter(
      (b) => b.textContent === '−' || b.textContent === '+'
    )
    expect(buttons).toHaveLength(4)
  })

  it('increments min price by 10 when + button is clicked', () => {
    render(<PriceFilter priceMin="20" priceMax="" />)
    const plusButtons = screen.getAllByRole('button').filter((b) => b.textContent === '+')
    fireEvent.click(plusButtons[0])
    expect(screen.getByPlaceholderText('Preț min')).toHaveValue('30')
  })

  it('decrements min price by 10 when − button is clicked', () => {
    render(<PriceFilter priceMin="30" priceMax="" />)
    const minusButtons = screen.getAllByRole('button').filter((b) => b.textContent === '−')
    fireEvent.click(minusButtons[0])
    expect(screen.getByPlaceholderText('Preț min')).toHaveValue('20')
  })

  it('min price never goes below 0', () => {
    render(<PriceFilter priceMin="5" priceMax="" />)
    const minusButtons = screen.getAllByRole('button').filter((b) => b.textContent === '−')
    fireEvent.click(minusButtons[0])
    expect(screen.getByPlaceholderText('Preț min')).toHaveValue('0')
  })

  it('increments max price by 10 when + button is clicked', () => {
    render(<PriceFilter priceMin="" priceMax="100" />)
    const plusButtons = screen.getAllByRole('button').filter((b) => b.textContent === '+')
    fireEvent.click(plusButtons[1])
    expect(screen.getByPlaceholderText('Preț max')).toHaveValue('110')
  })

  it('applies price_min and price_max params on Aplică click', () => {
    render(<PriceFilter priceMin="50" priceMax="200" />)
    fireEvent.click(screen.getByText('Aplică'))
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('price_min=50')
    )
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('price_max=200')
    )
  })

  it('omits price_min when empty on apply', () => {
    render(<PriceFilter priceMin="" priceMax="100" />)
    fireEvent.click(screen.getByText('Aplică'))
    const url = mockPush.mock.calls[0][0] as string
    expect(url).not.toContain('price_min')
    expect(url).toContain('price_max=100')
  })

  it('syncs state when URL props change', () => {
    const { rerender } = render(<PriceFilter priceMin="10" priceMax="50" />)
    rerender(<PriceFilter priceMin="20" priceMax="80" />)
    expect(screen.getByPlaceholderText('Preț min')).toHaveValue('20')
    expect(screen.getByPlaceholderText('Preț max')).toHaveValue('80')
  })
})
