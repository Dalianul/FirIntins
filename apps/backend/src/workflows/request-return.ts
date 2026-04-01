import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createReturnStep } from "./steps/create-return"
import { sendReturnConfirmationStep } from "./steps/send-return-confirmation"

export function isWithin14Days(createdAt: string | Date): boolean {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= 14
}

export type ReturnItem = {
  id: string
  quantity: number
  reason?: string
}

type RequestReturnInput = {
  orderId: string
  items: ReturnItem[]
  order: Record<string, unknown>
  customerEmail: string
}


export const requestReturnWorkflow = createWorkflow(
  "request-return",
  function (input: RequestReturnInput) {
    const returnResult = createReturnStep({
      orderId: input.orderId,
      items: input.items,
    })
    sendReturnConfirmationStep({
      orderId: input.orderId,
      customerEmail: input.customerEmail,
      returnItems: input.items,
    })
    return new WorkflowResponse(returnResult)
  }
)
