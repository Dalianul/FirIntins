import { Star } from "lucide-react"

interface RatingAggregateProps {
  reviews: Array<{ rating: number }>
  className?: string
}

export function RatingAggregate({ reviews, className = "" }: RatingAggregateProps) {
  if (reviews.length === 0) {
    return (
      <span className={`text-fog text-sm font-outfit ${className}`}>
        Fără recenzii încă
      </span>
    )
  }

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  const displayAverage = average.toFixed(1)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Star size={16} className="fill-mud stroke-mud" />
      <span className="text-mud font-outfit font-medium">{displayAverage}</span>
      <span className="text-fog text-sm font-outfit">
        ({reviews.length} {reviews.length === 1 ? "recenzie" : "recenzii"})
      </span>
    </div>
  )
}
