jest.mock("@/lib/analytics", () => ({
  trackViewItem: jest.fn(),
}))

import { render } from "@testing-library/react"
import { ViewItemTracker } from "@/components/analytics/view-item-tracker"
import { trackViewItem } from "@/lib/analytics"

const mockTrack = trackViewItem as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

describe("ViewItemTracker", () => {
  it("calls trackViewItem on mount with correct props", () => {
    render(<ViewItemTracker id="prod_1" title="Lanseta Crap" price={25000} />)
    expect(mockTrack).toHaveBeenCalledWith({ id: "prod_1", title: "Lanseta Crap", price: 25000 })
    expect(mockTrack).toHaveBeenCalledTimes(1)
  })

  it("calls trackViewItem without price when price is undefined", () => {
    render(<ViewItemTracker id="prod_1" title="Lanseta Crap" />)
    expect(mockTrack).toHaveBeenCalledWith({ id: "prod_1", title: "Lanseta Crap", price: undefined })
  })

  it("does not re-fire on re-render with same props", () => {
    const { rerender } = render(
      <ViewItemTracker id="prod_1" title="Lanseta Crap" price={25000} />
    )
    rerender(<ViewItemTracker id="prod_1" title="Lanseta Crap" price={25000} />)
    expect(mockTrack).toHaveBeenCalledTimes(1)
  })

  it("renders null — no visible output", () => {
    const { container } = render(<ViewItemTracker id="p1" title="T" />)
    expect(container.firstChild).toBeNull()
  })
})
