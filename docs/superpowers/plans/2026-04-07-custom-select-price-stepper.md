# Custom Select Dropdowns + Price Stepper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace native `<select>` elements (sort + category filters) with a custom Base UI Select component for full hover/styling control, and replace native number inputs in the price filter with custom +/− stepper buttons.

**Architecture:** Build a reusable `components/ui/select.tsx` wrapping `@base-ui/react/select` (already installed, v1.3.0), following the same pattern as `components/ui/sheet.tsx` which wraps `@base-ui/react/dialog`. Then refactor `sort-select.tsx` and `category-filter.tsx` to use it. Replace price filter `<Input type="number">` with flanking +/− buttons. All existing tests are updated to mock `@/components/ui/select` with a native select shim so test logic stays unchanged.

**Tech Stack:** Base UI v1.3.0 (`@base-ui/react/select`), Tailwind v4 CSS variables, lucide-react, Jest + @testing-library/react

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `components/ui/select.tsx` | Reusable Select primitives: Select, SelectTrigger, SelectValue, SelectContent, SelectItem |
| Modify | `components/product/sort-select.tsx` | Use custom Select instead of native `<select>` |
| Modify | `components/product/category-filter.tsx` | Use custom Select instead of native `<select>` |
| Modify | `components/product/price-filter.tsx` | Replace `<Input type="number">` with stepper (−/input/+) |
| Modify | `__tests__/unit/sort-select.test.tsx` | Mock `@/components/ui/select`, update test to use new interaction |
| Modify | `__tests__/unit/category-filter.test.tsx` | Mock `@/components/ui/select`, update test to use new interaction |
| Create | `__tests__/unit/price-filter.test.tsx` | New tests for stepper increment/decrement and apply |

---

### Task 1: Create `components/ui/select.tsx`

**Files:**
- Create: `apps/storefront/components/ui/select.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Select({ children, ...props }: SelectProps) {
  return (
    <SelectPrimitive.Root data-slot="select" {...(props as any)}>
      {children}
    </SelectPrimitive.Root>
  )
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex items-center justify-between gap-2 [background:var(--color-surface)] border border-[--color-fog]/20 text-sm text-[--color-fog] rounded px-3 py-1.5 focus:outline-none focus:border-[--color-moss] cursor-pointer whitespace-nowrap",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[--color-fog]/60" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectValue(
  props: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Popup>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={4}>
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "z-50 min-w-[var(--available-width,8rem)] [background:var(--color-surface)] border border-[--color-fog]/20 rounded shadow-xl py-1 outline-none",
            className
          )}
          {...props}
        >
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex items-center px-7 py-1.5 text-sm text-[--color-fog] cursor-pointer select-none outline-none",
        "hover:bg-[--color-bg-light] hover:text-[--color-white]",
        "data-[highlighted]:bg-[--color-bg-light] data-[highlighted]:text-[--color-white]",
        "data-[selected]:text-[--color-moss]",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-3 w-3 text-[--color-moss]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
```

- [ ] **Step 2: Verify TypeScript compiles without errors**

Run from `apps/storefront/`:
```bash
pnpm tsc --noEmit 2>&1 | grep "select.tsx"
```
Expected: no output (zero errors referencing select.tsx).

If there are type errors on `{...(props as any)}` in `Select`, that cast is intentional — Base UI's Root type is generic and `as any` avoids fighting the variance. Keep it.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/ui/select.tsx
git commit -m "feat: add custom Select component wrapping Base UI for dark-theme-aware dropdowns"
```

---

### Task 2: Refactor `sort-select.tsx` + update its tests

**Files:**
- Modify: `apps/storefront/components/product/sort-select.tsx`
- Modify: `apps/storefront/__tests__/unit/sort-select.test.tsx`

- [ ] **Step 1: Write the failing test first**

Replace `apps/storefront/__tests__/unit/sort-select.test.tsx` entirely:

```tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SortSelect from '@/components/product/sort-select'

const mockPush = jest.fn()
let mockParamsStr = ''

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ toString: () => mockParamsStr }),
}))

// Shim the Base UI Select with a native <select> so test assertions stay simple
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
```

- [ ] **Step 2: Run test — expect FAIL (SortSelect still uses native select, tests would pass but that's ok at this stage — confirm they pass before changing the component)**

```bash
cd apps/storefront && pnpm test -- --testPathPattern="sort-select" --no-coverage
```
Expected: all 5 tests PASS (the shim matches the current native select behavior)

- [ ] **Step 3: Rewrite `sort-select.tsx`**

Replace `apps/storefront/components/product/sort-select.tsx` entirely:

```tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SORT_OPTIONS = [
  { value: "relevance",  label: "Relevanță" },
  { value: "price_asc",  label: "Preț crescător" },
  { value: "price_desc", label: "Preț descrescător" },
  { value: "newest",     label: "Cele mai noi" },
  { value: "title_asc",  label: "Titlu A–Z" },
] as const

interface Props {
  sort: string
}

export default function SortSelect({ sort }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "relevance") {
      params.delete("sort")
    } else {
      params.set("sort", value)
    }
    params.delete("page")
    router.push("/produse?" + params.toString())
  }

  return (
    <Select value={sort || "relevance"} onValueChange={handleChange}>
      <SelectTrigger className="ml-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd apps/storefront && pnpm test -- --testPathPattern="sort-select" --no-coverage
```
Expected: all 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/components/product/sort-select.tsx \
        apps/storefront/__tests__/unit/sort-select.test.tsx
git commit -m "feat: replace native select in SortSelect with custom Base UI Select"
```

---

### Task 3: Refactor `category-filter.tsx` + update its tests

**Files:**
- Modify: `apps/storefront/components/product/category-filter.tsx`
- Modify: `apps/storefront/__tests__/unit/category-filter.test.tsx`

- [ ] **Step 1: Write the updated test file**

Replace `apps/storefront/__tests__/unit/category-filter.test.tsx` entirely:

```tsx
import React from 'react'
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
```

- [ ] **Step 2: Run test — confirm PASS before touching component**

```bash
cd apps/storefront && pnpm test -- --testPathPattern="category-filter" --no-coverage
```
Expected: all 6 tests PASS

- [ ] **Step 3: Rewrite `category-filter.tsx`**

Replace `apps/storefront/components/product/category-filter.tsx` entirely:

```tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Category {
  id: string
  name: string
}

interface Props {
  categories: Category[]
  category: string
}

export function CategoryFilter({ categories, category }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "") {
      params.delete("category")
    } else {
      params.set("category", value)
    }
    params.delete("page")
    router.push("/produse?" + params.toString())
  }

  return (
    <Select value={category || ""} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Toate categoriile</SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd apps/storefront && pnpm test -- --testPathPattern="category-filter" --no-coverage
```
Expected: all 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/components/product/category-filter.tsx \
        apps/storefront/__tests__/unit/category-filter.test.tsx
git commit -m "feat: replace native select in CategoryFilter with custom Base UI Select"
```

---

### Task 4: Replace PriceFilter number inputs with custom stepper buttons

**Files:**
- Modify: `apps/storefront/components/product/price-filter.tsx`
- Create: `apps/storefront/__tests__/unit/price-filter.test.tsx`

The stepper design: `[−] [____input____] [+]` flanking buttons, step size 10 RON, min never goes below 0.

- [ ] **Step 1: Write the failing test**

Create `apps/storefront/__tests__/unit/price-filter.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test — expect FAIL (PriceFilter doesn't have stepper buttons yet)**

```bash
cd apps/storefront && pnpm test -- --testPathPattern="price-filter" --no-coverage
```
Expected: FAIL — "renders 4 stepper buttons" and increment/decrement tests fail

- [ ] **Step 3: Rewrite `price-filter.tsx`**

Replace `apps/storefront/components/product/price-filter.tsx` entirely:

```tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
  priceMin: string
  priceMax: string
}

const STEP = 10

function StepButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[34px] w-6 flex items-center justify-center [background:var(--color-surface)] border border-[--color-fog]/20 text-[--color-fog]/60 hover:text-[--color-fog] hover:bg-[--color-bg-light] text-base leading-none transition-colors"
    >
      {children}
    </button>
  )
}

export function PriceFilter({ priceMin, priceMax }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [minPrice, setMinPrice] = useState(priceMin)
  const [maxPrice, setMaxPrice] = useState(priceMax)

  useEffect(() => {
    setMinPrice(priceMin)
    setMaxPrice(priceMax)
  }, [priceMin, priceMax])

  function adjustMin(delta: number) {
    const next = Math.max(0, (Number(minPrice) || 0) + delta)
    setMinPrice(String(next))
  }

  function adjustMax(delta: number) {
    const next = Math.max(0, (Number(maxPrice) || 0) + delta)
    setMaxPrice(String(next))
  }

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) {
      params.set("price_min", minPrice)
    } else {
      params.delete("price_min")
    }
    if (maxPrice) {
      params.set("price_max", maxPrice)
    } else {
      params.delete("price_max")
    }
    params.delete("page")
    router.push("/produse?" + params.toString())
  }

  return (
    <div className="flex items-center gap-2">
      {/* Min stepper */}
      <div className="flex items-center">
        <StepButton onClick={() => adjustMin(-STEP)}>−</StepButton>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Preț min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-20 rounded-none border-x-0 text-center [background:var(--color-surface)] border-[--color-fog]/20 text-[--color-fog] placeholder:text-[--color-fog]/40 text-sm focus-visible:ring-[--color-moss]"
        />
        <StepButton onClick={() => adjustMin(STEP)}>+</StepButton>
      </div>

      <span className="text-[--color-fog]/40 text-sm">–</span>

      {/* Max stepper */}
      <div className="flex items-center">
        <StepButton onClick={() => adjustMax(-STEP)}>−</StepButton>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Preț max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-20 rounded-none border-x-0 text-center [background:var(--color-surface)] border-[--color-fog]/20 text-[--color-fog] placeholder:text-[--color-fog]/40 text-sm focus-visible:ring-[--color-moss]"
        />
        <StepButton onClick={() => adjustMax(STEP)}>+</StepButton>
      </div>

      <Button
        onClick={handleApply}
        size="sm"
        className="bg-[--color-moss] text-white hover:bg-[--color-moss-light]"
      >
        Aplică
      </Button>
    </div>
  )
}
```

Note: `type="text" inputMode="numeric"` is used instead of `type="number"` — avoids spinner buttons entirely without CSS hacks, while still showing numeric keyboard on mobile.

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd apps/storefront && pnpm test -- --testPathPattern="price-filter" --no-coverage
```
Expected: all 9 tests PASS

- [ ] **Step 5: Run full test suite to confirm no regressions**

```bash
cd apps/storefront && pnpm test --no-coverage 2>&1 | tail -20
```
Expected: all pre-existing tests still pass. The sort-select and category-filter test changes are already committed, so this confirms nothing else broke.

- [ ] **Step 6: Commit**

```bash
git add apps/storefront/components/product/price-filter.tsx \
        apps/storefront/__tests__/unit/price-filter.test.tsx
git commit -m "feat: replace number inputs in PriceFilter with custom +/− stepper buttons"
```

---

## Self-Review

**Spec coverage:**
- ✅ Custom Select for sort dropdown (Task 2)
- ✅ Custom Select for category dropdown (Task 3)
- ✅ Custom +/− stepper for price filter (Task 4)
- ✅ No more native arrow / blue hover issue (Base UI Select renders its own popup)
- ✅ No more native number spinners (type="text" + steppers)

**Placeholder scan:** No TBD, no "similar to above", all code is complete.

**Type consistency:**
- `Select` → `onValueChange: (value: string) => void` — matches `handleChange(value: string)` in both sort-select and category-filter ✅
- `adjustMin/adjustMax` use `Math.max(0, ...)` — consistent with test expectation `'0'` for underflow ✅
- `StepButton` is a local component, not exported — YAGNI ✅
- Test mock `Button` exposes `onClick` and `children` — matches how `Aplică` button is tested ✅
