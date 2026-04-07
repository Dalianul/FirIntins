import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SortSelect from '@/components/product/sort-select'

const mockPush = jest.fn()
let mockParamsStr = ''

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ toString: () => mockParamsStr }),
}))

// Shim the custom Select with a native <select> so test assertions stay simple
jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <select value={value ?? ''} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
}))

describe('SortSelect', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockParamsStr = ''
  })

  it('renders all 5 sort options', () => {
    render(<SortSelect sort="" />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Relevanță')).toBeInTheDocument()
    expect(screen.getByText('Preț crescător')).toBeInTheDocument()
    expect(screen.getByText('Preț descrescător')).toBeInTheDocument()
    expect(screen.getByText('Cele mai noi')).toBeInTheDocument()
    expect(screen.getByText('Titlu A–Z')).toBeInTheDocument()
  })

  it('shows current sort value as selected', () => {
    render(<SortSelect sort="newest" />)
    expect(screen.getByRole('combobox')).toHaveValue('newest')
  })

  it('defaults to relevance when sort is empty', () => {
    render(<SortSelect sort="" />)
    expect(screen.getByRole('combobox')).toHaveValue('relevance')
  })

  it('sets sort param in URL when changed to non-default', () => {
    render(<SortSelect sort="" />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'price_asc' } })
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('sort=price_asc'))
  })

  it('removes sort param when changed back to relevance', () => {
    mockParamsStr = 'sort=price_asc&category=spinning'
    render(<SortSelect sort="price_asc" />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'relevance' } })
    const url = mockPush.mock.calls[0][0] as string
    expect(url).not.toContain('sort=')
    expect(url).toContain('category=spinning')
  })
})
