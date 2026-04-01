import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { initiateReturnWorkflow } from "@medusajs/medusa/core-flows"
import type { ReturnItem } from "../request-return"

type CreateReturnInput = {
  orderId: string
  items: ReturnItem[]
}

export const createReturnStep = createStep(
  "create-return-step",
  async (input: CreateReturnInput, { container }) => {
    const result = await initiateReturnWorkflow(container).run({
      input: {
        order_id: input.orderId,
        items: input.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          internal_note: item.reason,
        })),
      },
    })
    return new StepResponse(result)
  }
)
