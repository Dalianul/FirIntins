import { renderHook, act, waitFor } from "@testing-library/react"
import { CartProvider } from "@/context/cart-context"
import { useCart } from "@/hooks/use-cart"

// Mock the cart actions
jest.mock("@/actions/cart", () => ({
  createCart: jest.fn(),
  retrieveCart: jest.fn(),
  addItemToCart: jest.fn(),
  removeItemFromCart: jest.fn(),
  updateCartQuantity: jest.fn(),
}))

jest.mock("@/lib/analytics", () => ({
  trackAddToCart: jest.fn(),
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, "localStorage", { value: localStorageMock })

describe("CartProvider", () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it("provides itemCount of 0 when cart is empty", async () => {
    const { createCart } = require("@/actions/cart")
    createCart.mockResolvedValue({
      id: "test-cart-1",
      items: [],
      subtotal: 0,
      total: 0,
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    )
    const { result } = renderHook(() => useCart(), { wrapper })

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.itemCount).toBe(0)
  })

  it("initializes cart from localStorage when available", async () => {
    const { retrieveCart, createCart } = require("@/actions/cart")

    const existingCart = {
      id: "existing-cart",
      items: [
        {
          id: "item-1",
          variant_id: "var-1",
          product_title: "Test Product",
          variant_title: null,
          quantity: 2,
          unit_price: 5000,
          total: 10000,
        },
      ],
      subtotal: 10000,
      total: 10000,
    }

    retrieveCart.mockResolvedValue(existingCart)
    localStorageMock.setItem("firintins_cart_id", "existing-cart")

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    )
    const { result } = renderHook(() => useCart(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.itemCount).toBe(2)
    expect(result.current.cart?.id).toBe("existing-cart")
  })

  it("creates new cart when localStorage is empty", async () => {
    const { createCart } = require("@/actions/cart")
    const newCart = {
      id: "new-cart-1",
      items: [],
      subtotal: 0,
      total: 0,
    }
    createCart.mockResolvedValue(newCart)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    )
    const { result } = renderHook(() => useCart(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(createCart).toHaveBeenCalled()
    expect(result.current.cart?.id).toBe("new-cart-1")
  })

  it("sets loading to false after initialization", async () => {
    const { createCart } = require("@/actions/cart")
    createCart.mockResolvedValue({
      id: "test-cart",
      items: [],
      subtotal: 0,
      total: 0,
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    )
    const { result } = renderHook(() => useCart(), { wrapper })

    // Initially loading should be true
    expect(result.current.loading).toBe(true)

    // Wait for loading to become false
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })
})

describe("CartProvider — refreshCart", () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it("refreshCart updates cart state from server", async () => {
    const { createCart, retrieveCart } = require("@/actions/cart")

    const initialCart = { id: "cart-1", items: [], subtotal: 0, total: 0 }
    const refreshedCart = {
      id: "cart-1",
      items: [],
      subtotal: 0,
      discount_total: 500,
      promotions: [{ code: "FISH10" }],
      total: 9500,
    }

    createCart.mockResolvedValue(initialCart)
    retrieveCart.mockResolvedValue(refreshedCart)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    )
    const { result } = renderHook(() => useCart(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.refreshCart()
    })

    expect(retrieveCart).toHaveBeenCalledWith("cart-1")
    expect(result.current.cart?.discount_total).toBe(500)
    expect(result.current.cart?.promotions).toEqual([{ code: "FISH10" }])
  })

  it("refreshCart does nothing when cart is null", async () => {
    const { createCart, retrieveCart } = require("@/actions/cart")
    createCart.mockRejectedValue(new Error("no cart"))
    retrieveCart.mockResolvedValue(null)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    )
    const { result } = renderHook(() => useCart(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    // Should not throw
    await act(async () => {
      await result.current.refreshCart()
    })

    expect(result.current.cart).toBeNull()
  })
})

describe("CartProvider — analytics", () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it("calls trackAddToCart with the added item after successful addItem", async () => {
    const { createCart, addItemToCart } = require("@/actions/cart")
    const { trackAddToCart } = require("@/lib/analytics")

    const initialCart = { id: "cart-1", items: [], subtotal: 0, total: 0 }
    const addedItem = {
      id: "li_1",
      variant_id: "var_1",
      product_title: "Lanseta Crap",
      variant_title: "3.6m",
      quantity: 2,
      unit_price: 25000,
      total: 50000,
    }
    const updatedCart = { id: "cart-1", items: [addedItem], subtotal: 50000, total: 50000 }

    createCart.mockResolvedValue(initialCart)
    addItemToCart.mockResolvedValue({ success: true, cart: updatedCart })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    )
    const { result } = renderHook(() => useCart(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addItem("var_1", 2)
    })

    expect(trackAddToCart).toHaveBeenCalledWith(addedItem)
  })
})
