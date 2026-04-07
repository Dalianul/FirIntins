import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryFilter } from '@/components/product/category-filter'

const mockPush = jest.fn()
let mockParamsStr = ''

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ toString: () => mockParamsStr }),
}))

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

const categories = [
  { id: 'cat_spinning', name: 'Spinning' },
  { id: 'cat_crap', name: 'Crap' },
]

describe('CategoryFilter', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockParamsStr = ''
  })

  it('renders "Toate categoriile" as the first option', () => {
    render(<CategoryFilter categories={categories} category="" />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Toate categoriile')).toBeInTheDocument()
  })

  it('renders all provided categories as options', () => {
    render(<CategoryFilter categories={categories} category="" />)
    expect(screen.getByText('Spinning')).toBeInTheDocument()
    expect(screen.getByText('Crap')).toBeInTheDocument()
  })

  it('shows the current category as selected', () => {
    render(<CategoryFilter categories={categories} category="cat_spinning" />)
    expect(screen.getByRole('combobox')).toHaveValue('cat_spinning')
  })

  it('sets category param when a category is selected', () => {
    render(<CategoryFilter categories={categories} category="" />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cat_crap' } })
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('category=cat_crap')
    )
  })

  it('removes category param when "Toate categoriile" is selected', () => {
    mockParamsStr = 'category=cat_spinning&sort=newest'
    render(<CategoryFilter categories={categories} category="cat_spinning" />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } })
    const url = mockPush.mock.calls[0][0] as string
    expect(url).not.toContain('category=')
    expect(url).toContain('sort=newest')
  })

  it('pushes to absolute /produse path', () => {
    render(<CategoryFilter categories={categories} category="" />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cat_spinning' } })
    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/produse\?/))
  })
})
