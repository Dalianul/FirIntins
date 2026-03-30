import { Modules } from "@medusajs/framework/utils"
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const templateId = process.env.SENDGRID_TEMPLATE_ORDER_PLACED
  if (!templateId) {
    console.warn("[order-placed] SENDGRID_TEMPLATE_ORDER_PLACED not set, skipping email")
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
      "created_at",
      "currency_code",
      "items.*",
      "items.variant.*",
      "items.variant.product.*",
      "shipping_address.*",
      "shipping_methods.*",
      "shipping_methods.shipping_option.*",
      "summary.*",
      "customer.*",
    ],
    filters: { id: data.id },
  })

  const order = orders[0]
  if (!order) {
    console.warn(`[order-placed] Order ${data.id} not found, skipping email`)
    return
  }

  if (!order.email) {
    console.warn(`[order-placed] Order ${data.id} has no email address, skipping email`)
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
        email: order.email,
        items: (order.items || []).map((item) => ({
          title: item?.title,
          thumbnail: item?.thumbnail,
          quantity: item?.quantity,
          unit_price: item?.unit_price,
          subtotal: item?.subtotal,
        })),
        shipping_address: {
          address_1: order.shipping_address?.address_1,
          city: order.shipping_address?.city,
          postal_code: order.shipping_address?.postal_code,
        },
        subtotal: order.summary?.raw_original_order_total?.value,
        shipping_total: order.summary?.shipping_total,
        tax_total: order.summary?.tax_total,
        total: order.summary?.raw_current_order_total?.value,
        currency_code: order.currency_code,
      },
    })
  } catch (error) {
    console.error(`[order-placed] Failed to send email for order ${data.id}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
