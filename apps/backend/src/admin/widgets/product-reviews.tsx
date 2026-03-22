import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Badge, Button, Container, Text, Textarea } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../lib/client"

type Review = {
  id: string
  rating: number
  title: string
  body: string
  status: "pending" | "approved" | "rejected"
  admin_reply: string | null
  created_at: string
}

type ReviewsResponse = {
  reviews: Review[]
  count: number
}

type ModeratePayload = {
  review_id: string
  status: "approved" | "rejected"
  admin_reply?: string | null
}

function StatusBadge({ status }: { status: Review["status"] }) {
  const colorMap: Record<Review["status"], "orange" | "green" | "red"> = {
    pending: "orange",
    approved: "green",
    rejected: "red",
  }
  const labelMap: Record<Review["status"], string> = {
    pending: "În așteptare",
    approved: "Aprobat",
    rejected: "Respins",
  }
  return <Badge color={colorMap[status]}>{labelMap[status]}</Badge>
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  )
}

const ProductReviewsWidget = ({ data: product }: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()
  const queryKey = ["product-reviews", product.id]

  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({})
  const [editingReply, setEditingReply] = useState<Record<string, boolean>>({})

  const { data, isLoading } = useQuery<ReviewsResponse>({
    queryKey,
    queryFn: () =>
      sdk.client.fetch<ReviewsResponse>(`/admin/product-reviews?product_id=${product.id}`),
  })

  const moderate = useMutation({
    mutationFn: ({ review_id, status, admin_reply }: ModeratePayload) =>
      sdk.client.fetch(`/admin/product-reviews/${review_id}`, {
        method: "POST",
        body: { status, admin_reply },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const handleModerate = (review_id: string, status: "approved" | "rejected") => {
    const admin_reply = replyDraft[review_id] || null
    moderate.mutate({ review_id, status, admin_reply })
    setEditingReply((prev) => ({ ...prev, [review_id]: false }))
  }

  const handleSaveReply = (review: Review) => {
    moderate.mutate({
      review_id: review.id,
      status: review.status as "approved" | "rejected",
      admin_reply: replyDraft[review.id] ?? review.admin_reply,
    })
    setEditingReply((prev) => ({ ...prev, [review.id]: false }))
  }

  if (isLoading) {
    return (
      <Container>
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            Se încarcă recenziile...
          </Text>
        </div>
      </Container>
    )
  }

  const reviews = data?.reviews ?? []

  return (
    <Container>
      <div className="px-6 py-4 border-b border-ui-border-base">
        <div className="flex items-center justify-between">
          <Text size="small" leading="compact" weight="plus">
            Recenzii produs
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {data?.count ?? 0} total
          </Text>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            Nu există recenzii pentru acest produs.
          </Text>
        </div>
      ) : (
        <div className="divide-y divide-ui-border-base">
          {reviews.map((review) => (
            <div key={review.id} className="px-6 py-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    <StatusBadge status={review.status} />
                  </div>
                  <Text size="small" leading="compact" weight="plus">
                    {review.title}
                  </Text>
                </div>
                <Text size="small" leading="compact" className="text-ui-fg-subtle whitespace-nowrap">
                  {new Date(review.created_at).toLocaleDateString("ro-RO", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </div>

              <Text size="small" className="text-ui-fg-subtle">
                {review.body}
              </Text>

              {review.admin_reply && !editingReply[review.id] && (
                <div className="border-l-2 border-ui-border-interactive pl-3">
                  <Text size="small" leading="compact" weight="plus" className="mb-1">
                    Răspuns admin:
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {review.admin_reply}
                  </Text>
                </div>
              )}

              {editingReply[review.id] && (
                <Textarea
                  placeholder="Scrie un răspuns..."
                  value={replyDraft[review.id] ?? review.admin_reply ?? ""}
                  onChange={(e) =>
                    setReplyDraft((prev) => ({ ...prev, [review.id]: e.target.value }))
                  }
                  rows={3}
                />
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {review.status !== "approved" && (
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={moderate.isPending}
                    onClick={() => handleModerate(review.id, "approved")}
                  >
                    Aprobă
                  </Button>
                )}
                {review.status !== "rejected" && (
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={moderate.isPending}
                    onClick={() => handleModerate(review.id, "rejected")}
                  >
                    Respinge
                  </Button>
                )}

                {editingReply[review.id] ? (
                  <>
                    <Button
                      size="small"
                      variant="primary"
                      disabled={moderate.isPending || review.status === "pending"}
                      onClick={() => handleSaveReply(review)}
                    >
                      Salvează răspuns
                    </Button>
                    <Button
                      size="small"
                      variant="transparent"
                      onClick={() =>
                        setEditingReply((prev) => ({ ...prev, [review.id]: false }))
                      }
                    >
                      Anulează
                    </Button>
                  </>
                ) : (
                  <Button
                    size="small"
                    variant="transparent"
                    disabled={review.status === "pending"}
                    onClick={() => {
                      setReplyDraft((prev) => ({
                        ...prev,
                        [review.id]: review.admin_reply ?? "",
                      }))
                      setEditingReply((prev) => ({ ...prev, [review.id]: true }))
                    }}
                  >
                    {review.admin_reply ? "Editează răspuns" : "Adaugă răspuns"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductReviewsWidget
