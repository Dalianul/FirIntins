"use client"

import { useEffect, useRef } from "react"
import { trackPurchase } from "@/lib/analytics"
import type { GA4Item } from "@/lib/analytics"

interface PurchaseTrackerProps {
  orderId: string
  total: number
  items: GA4Item[]
}

export function PurchaseTracker({ orderId, total, items }: PurchaseTrackerProps) {
  const tracked = useRef(false)

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true
      trackPurchase(orderId, total, items)
    }
  }, [orderId, total, items])

  return null
}
