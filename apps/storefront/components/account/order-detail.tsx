import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface OrderItem {
  id: string
  title: string
  quantity: number
  product_id: string | null
  total: number | null
}

interface ShippingAddress {
  first_name?: string
  last_name?: string
  address_1?: string
  postal_code?: string
  city?: string
  country_code?: string
}

interface Order {
  id: string
  status: string
  created_at: string | Date
  items?: OrderItem[] | null
  subtotal?: number
  shipping_total?: number
  tax_total?: number
  total?: number
  shipping_address?: ShippingAddress | null
}

interface OrderDetailProps {
  order: Order
}

export function OrderDetail({ order }: OrderDetailProps) {
  const items = (order.items ?? []).filter((item) => item !== null)
  const shippingAddress = order.shipping_address

  const statusMap: Record<string, string> = {
    pending: "În așteptare",
    completed: "Completată",
    canceled: "Anulată",
  }

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    completed: "bg-moss/20 text-moss-light",
    canceled: "bg-red-500/20 text-red-400",
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-cormorant text-4xl text-cream mb-2">
            #{order.id.slice(0, 8)}
          </h1>
          <p className="text-fog">
            {new Date(order.created_at).toLocaleDateString("ro-RO")}
          </p>
        </div>
        <Badge className={statusColor[order.status] ?? ""}>
          {statusMap[order.status] ?? order.status}
        </Badge>
      </div>

      <div className="bg-surface-2 rounded p-6">
        <h2 className="font-outfit font-medium text-cream mb-4">Produse</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative h-20 w-20 bg-surface rounded overflow-hidden flex-shrink-0">
                <Image
                  src={`https://picsum.photos/100/100?random=${item.product_id ?? item.id}`}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-cream font-outfit">{item.title}</p>
                <p className="text-fog text-sm">{item.quantity}x</p>
              </div>
              <p className="text-mud">{formatPrice(item.total ?? 0)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-2 rounded p-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-fog">Subtotal</span>
          <span className="text-cream">{formatPrice(order.subtotal ?? 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-fog">Livrare</span>
          <span className="text-cream">{formatPrice(order.shipping_total ?? 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-fog">TVA</span>
          <span className="text-cream">{formatPrice(order.tax_total ?? 0)}</span>
        </div>
        <div className="flex justify-between text-lg pt-2 border-t border-border">
          <span className="font-outfit font-medium text-cream">Total</span>
          <span className="text-mud">{formatPrice(order.total ?? 0)}</span>
        </div>
      </div>

      {shippingAddress && (
        <div className="bg-surface-2 rounded p-6">
          <h3 className="font-outfit font-medium text-cream mb-3">Adresă livrare</h3>
          <p className="text-fog text-sm">
            {shippingAddress.first_name} {shippingAddress.last_name}
            <br />
            {shippingAddress.address_1}
            <br />
            {shippingAddress.postal_code} {shippingAddress.city}
            <br />
            {shippingAddress.country_code?.toUpperCase()}
          </p>
        </div>
      )}
    </div>
  )
}
