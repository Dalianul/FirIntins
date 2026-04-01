import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import type { ReturnItem } from "../request-return"

type SendReturnConfirmationInput = {
  orderId: string
  customerEmail: string
  returnItems: ReturnItem[]
}

export const sendReturnConfirmationStep = createStep(
  "send-return-confirmation-step",
  async (input: SendReturnConfirmationInput, { container }) => {
    const notificationService = container.resolve("notification")
    await notificationService.send({
      to: input.customerEmail,
      channel: "email",
      template: "return-confirmation",
      data: {
        order_id: input.orderId,
        items: input.returnItems,
        return_address: process.env.RETURN_ADDRESS,
      },
    })
    return new StepResponse({})
  }
)
