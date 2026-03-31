"use client"

import { useState } from "react"
import { useCart } from "@/hooks/use-cart"
import { applyPromoCodeAction, removePromoCodeAction } from "@/actions/checkout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function PromoCodeInput() {
  const { cart, refreshCart } = useCart()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cartId = cart?.id ?? ""
  const appliedCodes = cart?.promotions ?? []

  const handleApply = async () => {
    if (!cartId || !code.trim()) return
    setLoading(true)
    setError(null)
    const result = await applyPromoCodeAction(cartId, code)
    if (result.success) {
      setCode("")
      await refreshCart()
    } else {
      setError(result.error ?? "Cod invalid")
    }
    setLoading(false)
  }

  const handleRemove = async (promoCode: string) => {
    if (!cartId) return
    setError(null)
    const result = await removePromoCodeAction(cartId, promoCode)
    if (result.success) {
      await refreshCart()
    } else {
      setError(result.error ?? "A apărut o eroare")
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Cod promo"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          className="h-8 text-sm bg-[--color-bg] border-[--color-border] text-[--color-cream] placeholder:text-[--color-fog]/50"
          disabled={loading}
        />
        <Button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="h-8 px-3 text-xs bg-[--color-moss] hover:bg-[--color-moss-light] text-white shrink-0"
        >
          {loading ? "..." : "Aplică"}
        </Button>
      </div>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      {appliedCodes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {appliedCodes.map((promo) => (
            <span
              key={promo.code}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[--color-moss]/20 text-[--color-moss] text-xs rounded"
            >
              {promo.code}
              <button
                type="button"
                onClick={() => handleRemove(promo.code)}
                aria-label={`Elimină codul ${promo.code}`}
                className="hover:text-red-400 transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
