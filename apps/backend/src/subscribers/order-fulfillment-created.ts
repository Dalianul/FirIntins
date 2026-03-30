import { Modules } from "@medusajs/framework/utils"
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

export default async function orderFulfillmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ order_id: string; fulfillment_id: string; no_notification: boolean }>) {
  if (data.no_notification) {
    return
  }

  const templateId = process.env.SENDGRID_TEMPLATE_ORDER_SHIPPED
  if (!templateId) {
    console.warn("[order-fulfillment-created] SENDGRID_TEMPLATE_ORDER_SHIPPED not set, skipping email")
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
      "shipping_address.*",
      "fulfillments.*",
      "fulfillments.tracking_links.*",
    ],
    filters: { id: data.order_id },
  })

  const order = orders[0]
  if (!order) {
    console.warn(`[order-fulfillment-created] Order ${data.order_id} not found, skipping email`)
    return
  }

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: templateId,
      data: {
        order_id: order.display_id,
        customer_name: order.shipping_address?.first_name ?? order.email,
        shipping_address: {
          address_1: order.shipping_address?.address_1,
          city: order.shipping_address?.city,
          postal_code: order.shipping_address?.postal_code,
        },
        tracking_number: order.fulfillments?.[0]?.tracking_links?.[0]?.url ?? null,
      },
    })
  } catch (error) {
    console.error(
      `[order-fulfillment-created] Failed to send email for order ${data.order_id}:`,
      error
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
}
