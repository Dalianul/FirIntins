import { Modules } from "@medusajs/framework/utils"
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

export default async function orderCanceledHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const templateId = process.env.SENDGRID_TEMPLATE_ORDER_CANCELED
  if (!templateId) {
    console.warn("[order-canceled] SENDGRID_TEMPLATE_ORDER_CANCELED not set, skipping email")
    return
  }

  const query = container.resolve("query")
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "customer.*",
      "summary.*",
      "currency_code",
    ],
    filters: { id: data.id },
  })

  const order = orders[0]
  if (!order) {
    console.warn(`[order-canceled] Order ${data.id} not found, skipping email`)
    return
  }

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: templateId,
      data: {
        order_id: order.display_id,
        customer_name: order.customer?.first_name ?? order.email,
        total: order.summary?.raw_current_order_total?.value ?? 0,
        currency_code: order.currency_code,
      },
    })
  } catch (error) {
    console.error(`[order-canceled] Failed to send email for order ${data.id}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: "order.canceled",
}
