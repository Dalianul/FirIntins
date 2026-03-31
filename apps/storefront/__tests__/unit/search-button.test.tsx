import { render, screen, fireEvent } from '@testing-library/react'
import SearchButton from '@/components/layout/search-button'

const mockPush = jest.fn()
let mockQ: string | null = null

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: (key: string) => (key === 'q' ? mockQ : null) }),
}))

// motion/react AnimatePresence renders children immediately in tests
jest.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  m: {
    form: ({ children, onSubmit, ...props }: React.FormHTMLAttributes<HTMLFormElement> & { children: React.ReactNode }) =>
      <form onSubmit={onSubmit} {...props}>{children}</form>,
    button: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) =>
      <button onClick={onClick} {...props}>{children}</button>,
  },
}))

describe('SearchButton', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockQ = null
  })

  it('renders the search icon button when closed', () => {
    render(<SearchButton />)
    expect(screen.getByLabelText('Caută')).toBeInTheDocument()
  })

  it('opens the search input on click', () => {
    render(<SearchButton />)
    fireEvent.click(screen.getByLabelText('Caută'))
    expect(screen.getByPlaceholderText('Caută produse...')).toBeInTheDocument()
  })

  it('redirects to /produse?q=... on Enter', () => {
    render(<SearchButton />)
    fireEvent.click(screen.getByLabelText('Caută'))
    fireEvent.change(screen.getByPlaceholderText('Caută produse...'), {
      target: { value: 'undite crap' },
    })
    fireEvent.submit(screen.getByRole('form'))
    expect(mockPush).toHaveBeenCalledWith('/produse?q=undite%20crap')
  })

  it('redirects to /produse (no q) when submitting empty input', () => {
    render(<SearchButton />)
    fireEvent.click(screen.getByLabelText('Caută'))
    fireEvent.submit(screen.getByRole('form'))
    expect(mockPush).toHaveBeenCalledWith('/produse')
  })

  it('closes on X button click', () => {
    render(<SearchButton />)
    fireEvent.click(screen.getByLabelText('Caută'))
    fireEvent.click(screen.getByLabelText('Închide căutarea'))
    expect(screen.queryByPlaceholderText('Caută produse...')).not.toBeInTheDocument()
  })

  it('pre-fills input with current q param on open', () => {
    mockQ = 'undite'
    render(<SearchButton />)
    fireEvent.click(screen.getByLabelText('Caută'))
    expect(screen.getByPlaceholderText('Caută produse...')).toHaveValue('undite')
  })
})
