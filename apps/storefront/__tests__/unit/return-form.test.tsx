jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))
jest.mock("@/actions/return", () => ({
  requestReturn: jest.fn(),
}))

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ReturnForm } from "@/components/account/return-form"
import { useRouter } from "next/navigation"
import { requestReturn } from "@/actions/return"

const mockPush = jest.fn()
;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
const mockRequestReturn = requestReturn as jest.Mock

const mockOrder = {
  id: "order_test",
  items: [
    { id: "item_1", title: "Lanseta XYZ", quantity: 2 },
    { id: "item_2", title: "Mulineta ABC", quantity: 1 },
  ],
}

describe("ReturnForm", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  })

  it("renders order items as checkboxes", () => {
    render(<ReturnForm order={mockOrder} />)
    expect(screen.getByLabelText(/Lanseta XYZ/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mulineta ABC/i)).toBeInTheDocument()
  })

  it("calls requestReturn with selected items on submit", async () => {
    mockRequestReturn.mockResolvedValue({ success: true })
    render(<ReturnForm order={mockOrder} />)

    fireEvent.click(screen.getByLabelText(/Lanseta XYZ/i))
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Produs deteriorat" },
    })
    fireEvent.click(screen.getByText("Trimite cererea de retur"))

    await waitFor(() => {
      expect(mockRequestReturn).toHaveBeenCalledWith(
        "order_test",
        expect.objectContaining({
          items: [expect.objectContaining({ line_item_id: "item_1" })],
          reason: "Produs deteriorat",
        })
      )
    })
  })

  it("redirects to order page with ?retur=success on success", async () => {
    mockRequestReturn.mockResolvedValue({ success: true })
    render(<ReturnForm order={mockOrder} />)

    fireEvent.click(screen.getByLabelText(/Lanseta XYZ/i))
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "M-am răzgândit" },
    })
    fireEvent.click(screen.getByText("Trimite cererea de retur"))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/cont/comenzi/order_test?retur=success"
      )
    })
  })

  it("shows error message on failure", async () => {
    mockRequestReturn.mockResolvedValue({
      success: false,
      error: "Perioada de retur a expirat",
    })
    render(<ReturnForm order={mockOrder} />)

    fireEvent.click(screen.getByLabelText(/Lanseta XYZ/i))
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Produs greșit" },
    })
    fireEvent.click(screen.getByText("Trimite cererea de retur"))

    await waitFor(() => {
      expect(
        screen.getByText("Perioada de retur a expirat")
      ).toBeInTheDocument()
    })
  })

  it("submit button is disabled when no items selected", () => {
    render(<ReturnForm order={mockOrder} />)
    expect(screen.getByText("Trimite cererea de retur")).toBeDisabled()
  })
})
