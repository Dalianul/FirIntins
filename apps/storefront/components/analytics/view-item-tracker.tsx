"use client"

import { useEffect } from "react"
import { trackViewItem } from "@/lib/analytics"

interface ViewItemTrackerProps {
  id: string
  title: string
  price?: number
}

export function ViewItemTracker({ id, title, price }: ViewItemTrackerProps) {
  useEffect(() => {
    trackViewItem({ id, title, price })
  }, [id, title, price])

  return null
}
