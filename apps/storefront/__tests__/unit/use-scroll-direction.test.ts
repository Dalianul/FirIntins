/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react"
import { useScrollDirection } from "@/hooks/use-scroll-direction"

function fireScroll(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, writable: true, configurable: true })
  window.dispatchEvent(new Event("scroll"))
}

describe("useScrollDirection", () => {
  beforeEach(() => {
    fireScroll(0)
  })

  it("returns 'up' initially", () => {
    const { result } = renderHook(() => useScrollDirection())
    expect(result.current).toBe("up")
  })

  it("returns 'down' when scrolling down past threshold", () => {
    const { result } = renderHook(() => useScrollDirection())
    act(() => fireScroll(100))
    act(() => fireScroll(150))
    expect(result.current).toBe("down")
  })

  it("returns 'up' when scrolling up after scrolling down", () => {
    const { result } = renderHook(() => useScrollDirection())
    act(() => fireScroll(200))
    act(() => fireScroll(100))
    expect(result.current).toBe("up")
  })

  it("returns 'up' when scrollY < 80 regardless of direction", () => {
    const { result } = renderHook(() => useScrollDirection())
    act(() => fireScroll(200))
    act(() => fireScroll(300))
    expect(result.current).toBe("down")
    act(() => fireScroll(40))
    expect(result.current).toBe("up")
  })
})
