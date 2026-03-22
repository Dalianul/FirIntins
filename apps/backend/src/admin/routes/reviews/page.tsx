import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Select, Text, Textarea } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../../lib/client"

type Review = {
  id: string
  rating: number
  title: string
  body: string
  status: "pending" | "approved" | "rejected"
  admin_reply: string | null
  product_id: string
  created_at: string
}

type ReviewsResponse = {
  reviews: Review[]
  count: number
}

type StatusFilter = "all" | "pending" | "approved" | "rejected"

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

const ReviewsPage = () => {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending")
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({})
  const [editingReply, setEditingReply] = useState<Record<string, boolean>>({})

  const queryKey = ["admin-reviews", statusFilter]

  const { data, isLoading } = useQuery<ReviewsResponse>({
    queryKey,
    queryFn: () => {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : ""
      return sdk.client.fetch<ReviewsResponse>(`/admin/product-reviews${params}`)
    },
  })

  const moderate = useMutation({
    mutationFn: ({ review_id, status, admin_reply }: ModeratePayload) =>
      sdk.client.fetch(`/admin/product-reviews/${review_id}`, {
        method: "POST",
        body: { status, admin_reply },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] })
    },
  })

  const handleModerate = (review_id: string, status: "approved" | "rejected") => {
    const admin_reply = replyDraft[review_id] ?? null
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

  const reviews = data?.reviews ?? []

  return (
    <div className="flex flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <Text size="xlarge" weight="plus">
            Recenzii clienți
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            {data?.count ?? 0} recenzii {statusFilter !== "all" ? `cu status "${statusFilter}"` : "total"}
          </Text>
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <Select.Trigger>
            <Select.Value placeholder="Filtrează după status" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">Toate</Select.Item>
            <Select.Item value="pending">În așteptare</Select.Item>
            <Select.Item value="approved">Aprobate</Select.Item>
            <Select.Item value="rejected">Respinse</Select.Item>
          </Select.Content>
        </Select>
      </div>

      <Container>
        {isLoading ? (
          <div className="px-6 py-4">
            <Text size="small" className="text-ui-fg-subtle">
              Se încarcă...
            </Text>
          </div>
        ) : reviews.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Text size="small" className="text-ui-fg-subtle">
              Nu există recenzii pentru filtrul selectat.
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
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      Produs: {review.product_id}
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
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Recenzii",
})

export default ReviewsPage
