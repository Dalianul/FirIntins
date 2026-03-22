import { render, screen, fireEvent } from "@testing-library/react"
import { CategoryFilter } from "@/components/blog/category-filter"

const categories = [
  { id: "1", slug: "ghiduri", name: "Ghiduri" },
  { id: "2", slug: "noutati", name: "Noutăți" },
]

describe("CategoryFilter", () => {
  test("renders Toate tab plus all categories", () => {
    render(<CategoryFilter categories={categories} onSelect={jest.fn()} selected={null} />)
    expect(screen.getByText("Toate")).toBeInTheDocument()
    expect(screen.getByText("Ghiduri")).toBeInTheDocument()
    expect(screen.getByText("Noutăți")).toBeInTheDocument()
  })

  test("calls onSelect with null when Toate is clicked", () => {
    const onSelect = jest.fn()
    render(<CategoryFilter categories={categories} onSelect={onSelect} selected="ghiduri" />)
    fireEvent.click(screen.getByText("Toate"))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  test("calls onSelect with slug when category tab is clicked", () => {
    const onSelect = jest.fn()
    render(<CategoryFilter categories={categories} onSelect={onSelect} selected={null} />)
    fireEvent.click(screen.getByText("Ghiduri"))
    expect(onSelect).toHaveBeenCalledWith("ghiduri")
  })

  test("marks selected tab as active", () => {
    render(<CategoryFilter categories={categories} onSelect={jest.fn()} selected="ghiduri" />)
    const activeTab = screen.getByText("Ghiduri").closest("button")
    expect(activeTab).toHaveAttribute("aria-pressed", "true")
  })
})
