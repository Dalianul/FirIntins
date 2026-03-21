"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { medusa } from "@/lib/medusa/client"
import { selectShippingAction } from "@/actions/checkout"
import { formatPrice } from "@/lib/utils"

interface ShippingOption {
  id: string
  name: string
  amount: number | null
}

interface ShippingStepProps {
  cartId: string
  onNext: () => void
  onBack: () => void
}

export function ShippingStep({ cartId, onNext, onBack }: ShippingStepProps) {
  const { toast } = useToast()
  const [options, setOptions] = useState<ShippingOption[]>([])
  const [selected, setSelected] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const result = await medusa.store.fulfillment.listCartOptions({ cart_id: cartId })
        const opts = (result.shipping_options ?? []) as ShippingOption[]
        setOptions(opts)
        if (opts[0]?.id) setSelected(opts[0].id)
      } catch (error) {
        console.error("Failed to load shipping options:", error)
      }
    }
    fetchOptions()
  }, [cartId])

  const handleNext = async () => {
    if (!selected) return
    setLoading(true)
    try {
      const result = await selectShippingAction(cartId, selected)
      if (result.success) {
        onNext()
      } else {
        toast({ title: "Eroare", description: result.error, variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-outfit font-medium text-cream text-xl">Metodă livrare</h2>
      <RadioGroup value={selected} onValueChange={setSelected}>
        {options.map((option) => (
          <div
            key={option.id}
            className="flex items-center space-x-2 p-4 border border-border rounded cursor-pointer hover:border-moss transition-colors"
          >
            <RadioGroupItem value={option.id} id={option.id} />
            <label
              htmlFor={option.id}
              className="flex-1 cursor-pointer flex justify-between"
            >
              <span className="text-cream font-outfit font-medium">{option.name}</span>
              <span className="text-mud">{formatPrice(option.amount ?? 0)}</span>
            </label>
          </div>
        ))}
      </RadioGroup>
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 border-border text-cream" onClick={onBack}>
          Înapoi
        </Button>
        <Button
          disabled={!selected || loading}
          className="flex-1 bg-moss hover:bg-moss-light"
          onClick={handleNext}
        >
          {loading ? "Se procesează..." : "Continuă la plată"}
        </Button>
      </div>
    </div>
  )
}
