import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

interface TrackingLink {
  url: string
  tracking_number: string
}

interface Fulfillment {
  id: string
  tracking_links?: TrackingLink[]
}

interface OrderReturn {
  id: string
  status: string
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
  fulfillments?: Fulfillment[]
  returns?: OrderReturn[]
  metadata?: Record<string, unknown> | null
}

interface OrderDetailProps {
  order: Order
  returnSuccess?: boolean
}

export function OrderDetail({ order, returnSuccess }: OrderDetailProps) {
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

  const diffDays =
    (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24)
  const activeReturn = order.returns?.find((r) => r.status !== "canceled")
  const canReturn =
    order.status === "completed" && diffDays <= 14 && !activeReturn

  const trackingLinks =
    order.fulfillments?.flatMap((f) => f.tracking_links ?? []) ?? []

  return (
    <div className="space-y-8">
      {returnSuccess && (
        <div className="bg-moss/20 border border-moss/30 rounded p-4 text-moss-light text-sm">
          Cererea de retur a fost înregistrată. Vei primi un email cu
          instrucțiunile.
        </div>
      )}

      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="font-cormorant text-4xl text-cream mb-2">
            #{order.id.slice(0, 8)}
          </h1>
          <p className="text-fog">
            {new Date(order.created_at).toLocaleDateString("ro-RO")}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {activeReturn && (
            <Badge variant="secondary">Retur solicitat</Badge>
          )}
          <Badge className={statusColor[order.status] ?? ""}>
            {statusMap[order.status] ?? order.status}
          </Badge>
        </div>
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
          <span className="text-cream">
            {formatPrice(order.shipping_total ?? 0)}
          </span>
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
          <h3 className="font-outfit font-medium text-cream mb-3">
            Adresă livrare
          </h3>
          <p className="text-fog text-sm">
            {shippingAddress.first_name} {shippingAddress.last_name}
            <br />
            {shippingAddress.address_1}
            <br />
            {shippingAddress.postal_code} {shippingAddress.city}
            <br />
            {shippingAddress.country_code?.toUpperCase()}
          </p>
          {!!order.metadata?.cui && (
            <p className="text-fog text-sm mt-2">
              Cod fiscal: {String(order.metadata.cui)}
            </p>
          )}
        </div>
      )}

      {trackingLinks.length > 0 && (
        <div className="bg-surface-2 rounded p-6">
          <h3 className="font-outfit font-medium text-cream mb-3">
            Urmărire colet
          </h3>
          <div className="space-y-1">
            {trackingLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-moss-light text-sm hover:underline block"
              >
                {link.tracking_number}
              </a>
            ))}
          </div>
        </div>
      )}

      {canReturn && (
        <div className="pt-2">
          <Link href={`/cont/comenzi/${order.id}/retur`}>
            <Button variant="outline" size="sm" className="border-border">
              Solicită retur
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
