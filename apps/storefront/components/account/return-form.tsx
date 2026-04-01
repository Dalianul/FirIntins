"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { requestReturn, type ReturnFormData } from "@/actions/return"

interface ReturnItem {
  id: string
  title: string
  quantity: number
}

interface ReturnFormProps {
  order: {
    id: string
    items?: ReturnItem[] | null
  }
}

const RETURN_REASONS = [
  "Produs deteriorat",
  "Produs greșit",
  "M-am răzgândit",
  "Altul",
]

export function ReturnForm({ order }: ReturnFormProps) {
  const router = useRouter()
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(
    new Map()
  )
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const items = order.items ?? []

  const toggleItem = (itemId: string, maxQty: number) => {
    setSelectedItems((prev) => {
      const next = new Map(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.set(itemId, maxQty)
      }
      return next
    })
  }

  const updateQuantity = (itemId: string, qty: number) => {
    setSelectedItems((prev) => {
      const next = new Map(prev)
      next.set(itemId, qty)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedItems.size === 0 || !reason) return
    setSubmitting(true)
    setError(null)

    const data: ReturnFormData = {
      items: Array.from(selectedItems.entries()).map(
        ([line_item_id, quantity]) => ({ line_item_id, quantity })
      ),
      reason,
    }

    const result = await requestReturn(order.id, data)
    if (result.success) {
      router.push(`/cont/comenzi/${order.id}?retur=success`)
    } else {
      setError(result.error ?? "Eroare la trimiterea cererii")
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="font-cormorant text-3xl text-cream">Cerere retur</h2>

      <div className="bg-surface-2 rounded p-6 space-y-4">
        <h3 className="font-outfit font-medium text-cream mb-3">Produse</h3>
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <input
              type="checkbox"
              id={`item-${item.id}`}
              checked={selectedItems.has(item.id)}
              onChange={() => toggleItem(item.id, item.quantity)}
              className="rounded border-border"
            />
            <Label
              htmlFor={`item-${item.id}`}
              className="flex-1 text-fog cursor-pointer"
            >
              {item.title}
            </Label>
            {selectedItems.has(item.id) && (
              <input
                type="number"
                min={1}
                max={item.quantity}
                value={selectedItems.get(item.id)}
                onChange={(e) =>
                  updateQuantity(item.id, Number(e.target.value))
                }
                className="w-16 bg-surface border border-border rounded px-2 py-1 text-cream text-sm"
                aria-label={`Cantitate ${item.title}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label className="text-fog">Motiv retur</Label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-surface border border-border rounded px-3 py-2 text-cream"
        >
          <option value="">Selectează motivul</option>
          {RETURN_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button
        type="submit"
        disabled={submitting || selectedItems.size === 0 || !reason}
        className="w-full bg-moss hover:opacity-90"
      >
        {submitting ? "Se trimite..." : "Trimite cererea de retur"}
      </Button>
    </form>
  )
}
