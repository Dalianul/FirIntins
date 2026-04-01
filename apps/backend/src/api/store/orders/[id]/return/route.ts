import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  requestReturnWorkflow,
  isWithin14Days,
} from "../../../../../workflows/request-return"

interface ReturnRequestBody {
  items: Array<{ line_item_id: string; quantity: number; reason?: string }>
  reason: string
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    return res.status(401).json({ message: "Neautorizat" })
  }

  const { id } = req.params as { id: string }
  const body = req.body as ReturnRequestBody

  const orderModuleService = req.scope.resolve("order") as any
  let order: any
  try {
    order = await orderModuleService.retrieveOrder(id, {
      relations: ["items", "returns"],
    })
  } catch {
    return res.status(404).json({ message: "Comanda nu a fost găsită" })
  }

  if (order.customer_id !== customerId) {
    return res.status(403).json({ message: "Acces interzis" })
  }

  if (order.status !== "completed") {
    return res.status(400).json({ message: "Comanda nu poate fi returnată" })
  }

  if (!isWithin14Days(order.created_at)) {
    return res
      .status(400)
      .json({ message: "Perioada de retur de 14 zile a expirat" })
  }

  const activeReturn = order.returns?.find(
    (r: any) => r.status !== "canceled"
  )
  if (activeReturn) {
    return res.status(400).json({
      message: "Există deja o cerere de retur pentru această comandă",
    })
  }

  try {
    const { result } = await requestReturnWorkflow(req.scope).run({
      input: {
        orderId: id,
        items: body.items.map((item) => ({
          id: item.line_item_id,
          quantity: item.quantity,
          reason: item.reason,
        })),
        order,
        customerEmail: order.email,
      },
    })
    return res.status(201).json({ return: result })
  } catch (error) {
    console.error("Return workflow error:", error)
    return res.status(500).json({ message: "Eroare la procesarea returului" })
  }
}
