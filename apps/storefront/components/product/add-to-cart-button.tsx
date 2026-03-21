"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"

interface AddToCartButtonProps {
  productId: string
  variant: { id: string } | null | undefined
  disabled?: boolean
  outOfStock?: boolean
}

export function AddToCartButton({ productId, variant, disabled = false, outOfStock = false }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!variant?.id) return
    setLoading(true)
    try {
      await addItem(variant.id, 1)
      toast({ title: "Adaugat", description: "Produsul a fost adăugat în coș" })
    } catch {
      toast({ title: "Eroare", description: "Nu am putut adauga produsul în coș", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || outOfStock || loading}
      className="w-full bg-moss hover:bg-moss-light text-white py-6 text-lg"
    >
      {outOfStock ? "Stoc epuizat" : loading ? "Se adaugă..." : "Adaugă în coș"}
    </Button>
  )
}
