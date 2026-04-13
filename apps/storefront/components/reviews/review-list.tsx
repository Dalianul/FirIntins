import { getProductReviewsAction } from "@/actions/review"
import { ReviewCard } from "./review-card"
import { RatingAggregate } from "./rating-aggregate"

interface ReviewListProps {
  productId: string
}

export async function ReviewList({ productId }: ReviewListProps) {
  const { reviews, count } = await getProductReviewsAction(productId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-cormorant text-xl text-[#1c1a15]">Recenzii clienți</h3>
        <RatingAggregate reviews={reviews} />
      </div>

      {count === 0 ? (
        <p className="text-fog text-sm font-outfit py-8 text-center">
          Nu există recenzii aprobate pentru acest produs încă.
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}
