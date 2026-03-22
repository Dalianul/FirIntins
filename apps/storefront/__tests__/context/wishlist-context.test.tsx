import { renderHook, waitFor, act } from "@testing-library/react"
import { ReactNode } from "react"
import { WishlistProvider, useWishlist } from "@/context/wishlist-context"

jest.mock("@/actions/wishlist", () => ({
  getWishlistAction: jest.fn(),
  addToWishlistAction: jest.fn(),
  removeFromWishlistAction: jest.fn(),
}))

import {
  getWishlistAction,
  addToWishlistAction,
  removeFromWishlistAction,
} from "@/actions/wishlist"

const mockGetWishlist = getWishlistAction as jest.Mock
const mockAddToWishlist = addToWishlistAction as jest.Mock
const mockRemoveFromWishlist = removeFromWishlistAction as jest.Mock

const wrapper = ({ children }: { children: ReactNode }) => (
  <WishlistProvider>{children}</WishlistProvider>
)

describe("useWishlist", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("initializes with empty wishlist", async () => {
    mockGetWishlist.mockResolvedValue({ wishlist: null })

    const { result } = renderHook(() => useWishlist(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.wishlist).toBeNull()
    expect(result.current.itemCount).toBe(0)
  })

  it("loads existing wishlist on mount", async () => {
    mockGetWishlist.mockResolvedValue({
      wishlist: { id: "wl_1", items: [{ id: "wli_1", product_id: "prod_1" }] },
    })

    const { result } = renderHook(() => useWishlist(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.wishlist?.id).toBe("wl_1")
    expect(result.current.itemCount).toBe(1)
  })

  it("isInWishlist returns true for product in wishlist", async () => {
    mockGetWishlist.mockResolvedValue({
      wishlist: { id: "wl_1", items: [{ id: "wli_1", product_id: "prod_1", variant_id: "" }] },
    })

    const { result } = renderHook(() => useWishlist(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.isInWishlist("prod_1")).toBe(true)
    expect(result.current.isInWishlist("prod_999")).toBe(false)
  })

  it("addItem calls action and updates state", async () => {
    mockGetWishlist.mockResolvedValue({ wishlist: { id: "wl_1", items: [] } })
    mockAddToWishlist.mockResolvedValue({
      success: true,
      item: { id: "wli_2", product_id: "prod_2", variant_id: "" },
    })

    const { result } = renderHook(() => useWishlist(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addItem("prod_2")
    })

    expect(result.current.itemCount).toBe(1)
  })

  it("removeItem calls action and updates state", async () => {
    mockGetWishlist.mockResolvedValue({
      wishlist: {
        id: "wl_1",
        items: [{ id: "wli_1", product_id: "prod_1", variant_id: "" }],
      },
    })
    mockRemoveFromWishlist.mockResolvedValue({ success: true })

    const { result } = renderHook(() => useWishlist(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.removeItem("wli_1")
    })

    expect(result.current.itemCount).toBe(0)
  })
})
