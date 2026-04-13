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
  const [removingCodes, setRemovingCodes] = useState<Set<string>>(new Set())

  const cartId = cart?.id ?? ""
  const allPromotions = cart?.promotions ?? []
  const appliedCodes = allPromotions.filter((p) => !p.is_automatic)
  const isReady = cart !== null

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
    if (!cartId || removingCodes.has(promoCode)) return
    setError(null)
    setRemovingCodes(prev => new Set(prev).add(promoCode))
    try {
      const result = await removePromoCodeAction(cartId, promoCode)
      if (result.success) {
        await refreshCart()
      } else {
        setError(result.error ?? "A apărut o eroare")
      }
    } finally {
      setRemovingCodes(prev => {
        const next = new Set(prev)
        next.delete(promoCode)
        return next
      })
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
          className="h-10 text-xs"
          disabled={loading || !isReady}
        />
        <Button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim() || !isReady}
          variant="brand"
          className="h-10 rounded-none px-4 text-[11px] font-outfit uppercase tracking-[0.14em] shrink-0"
        >
          {loading ? "..." : "Aplică"}
        </Button>
      </div>

      {error && (
        <p className="text-red-600 text-xs">{error}</p>
      )}

      {appliedCodes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {appliedCodes.map((promo) => (
            <span
              key={promo.code}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-moss/20 text-moss text-xs rounded"
            >
              {promo.code}
              <button
                type="button"
                onClick={() => handleRemove(promo.code)}
                aria-label={`Elimină codul ${promo.code}`}
                disabled={removingCodes.has(promo.code)}
                className="hover:text-red-400 transition-colors disabled:opacity-50"
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
