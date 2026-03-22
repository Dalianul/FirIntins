import { z } from "zod"

export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(255),
  body: z.string().min(1).max(2000),
  order_id: z.string().optional().nullable(),
})

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>
