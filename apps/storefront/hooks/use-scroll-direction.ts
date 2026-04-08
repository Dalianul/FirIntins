"use client"

import { useEffect, useRef, useState } from "react"

export type ScrollDirection = "up" | "down"

export function useScrollDirection(): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>("up")
  const lastScrollY = useRef(0)

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY

      if (currentY < 80) {
        setDirection("up")
      } else if (currentY > lastScrollY.current) {
        setDirection("down")
      } else {
        setDirection("up")
      }

      lastScrollY.current = currentY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return direction
}
