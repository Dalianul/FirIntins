"use client"

import { useState } from "react"
import { RatingStars } from "./rating-stars"
import { createReviewAction } from "@/actions/review"

interface ReviewFormProps {
  productId: string
  isAuthenticated: boolean
}

export function ReviewForm({ productId, isAuthenticated }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isAuthenticated) {
    return (
      <div className="border border-border rounded p-4 bg-surface text-center">
        <p className="text-fog text-sm font-outfit">
          <a href="/autentificare" className="text-moss-light underline underline-offset-2">
            Autentifică-te
          </a>{" "}
          pentru a lăsa o recenzie.
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="border border-moss rounded p-4 bg-surface">
        <p className="text-moss-light text-sm font-outfit text-center">
          Recenzia ta a fost trimisă și va apărea după aprobare. Mulțumim!
        </p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setError("Selectează un număr de stele.")
      return
    }
    setPending(true)
    setError(null)
    const result = await createReviewAction(productId, { rating, title, body })
    setPending(false)
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded p-4 bg-surface space-y-4">
      <h4 className="font-cormorant text-lg text-cream">Lasă o recenzie</h4>

      <div>
        <label className="block text-fog text-xs font-outfit mb-1">Rating *</label>
        <RatingStars
          rating={rating}
          size={22}
          interactive
          onChange={setRating}
        />
      </div>

      <div>
        <label htmlFor="review-title" className="block text-fog text-xs font-outfit mb-1">
          Titlu *
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          required
          className="w-full bg-bg border border-border rounded px-3 py-2 text-cream text-sm font-outfit focus:outline-none focus:border-moss"
          placeholder="Rezumat scurt..."
        />
      </div>

      <div>
        <label htmlFor="review-body" className="block text-fog text-xs font-outfit mb-1">
          Recenzie *
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          required
          rows={4}
          className="w-full bg-bg border border-border rounded px-3 py-2 text-cream text-sm font-outfit focus:outline-none focus:border-moss resize-none"
          placeholder="Descrie experiența ta cu produsul..."
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs font-outfit">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-moss hover:bg-moss-light disabled:opacity-50 text-cream text-sm font-outfit py-2 px-4 rounded transition-colors"
      >
        {pending ? "Se trimite..." : "Trimite recenzia"}
      </button>
    </form>
  )
}
