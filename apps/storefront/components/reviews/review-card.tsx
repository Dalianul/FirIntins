import { RatingStars } from "./rating-stars"

interface Review {
  id: string
  rating: number
  title: string
  body: string
  admin_reply?: string | null
  created_at: string
}

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const date = new Date(review.created_at).toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <article className="border border-border rounded p-4 bg-surface space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <RatingStars rating={review.rating} size={14} />
          <h4 className="font-outfit font-medium text-cream text-sm">{review.title}</h4>
        </div>
        <time className="text-fog text-xs font-outfit whitespace-nowrap">{date}</time>
      </div>

      <p className="text-fog text-sm font-outfit leading-relaxed">{review.body}</p>

      <p className="text-xs text-moss-light font-outfit">Client verificat</p>

      {review.admin_reply && (
        <div className="border-l-2 border-moss pl-3 mt-2">
          <p className="text-xs text-fog font-outfit font-medium mb-1">Răspuns Fir &amp; Instinct:</p>
          <p className="text-sm text-fog font-outfit leading-relaxed">{review.admin_reply}</p>
        </div>
      )}
    </article>
  )
}
