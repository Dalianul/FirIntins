"use client"

import { Star } from "lucide-react"

interface RatingStarsProps {
  rating: number
  max?: number
  size?: number
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function RatingStars({
  rating,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
  className = "",
}: RatingStarsProps) {
  return (
    <div className={`flex gap-0.5 ${className}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(rating)
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={interactive ? "cursor-pointer" : "cursor-default pointer-events-none"}
            aria-label={interactive ? `Acordă ${i + 1} stele` : undefined}
          >
            <Star
              size={size}
              className={
                filled
                  ? "fill-mud stroke-mud"
                  : "fill-transparent stroke-border"
              }
            />
          </button>
        )
      })}
    </div>
  )
}
