import Image from "next/image"
import { formatPrice } from "@/lib/utils"

interface OrderItem {
  id: string
  title: string
  quantity: number
  product_id: string
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
  items?: OrderItem[]
  subtotal?: number
  shipping_total?: number
  tax_total?: number
  total?: number
  shipping_address?: ShippingAddress
}

interface ConfirmationDisplayProps {
  order: Order
}

export function ConfirmationDisplay({ order }: ConfirmationDisplayProps) {
  const items = order.items ?? []
  const shippingAddress = order.shipping_address

  return (
    <div className="space-y-8">
      {/* Success message */}
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-16 w-16 rounded-full flex items-center justify-center bg-moss">
            <span className="text-3xl text-moss">✓</span>
          </div>
        </div>
        <h1 className="font-cormorant text-4xl mb-2 text-cream">
          Comandă confirmată
        </h1>
        <p className="text-fog">
          Mulțumim pentru achiziție! Ți-am trimis o confirmare pe email.
        </p>
      </div>

      {/* Order details */}
      <div className="rounded p-6 space-y-6 bg-surface-2">
        <div>
          <p className="text-sm mb-1 text-fog">ID comandă</p>
          <p className="font-medium text-cream font-outfit">{order.id}</p>
        </div>

        {/* Items */}
        <div>
          <h2 className="font-medium mb-4 text-cream font-outfit">Produse</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-20 w-20 rounded overflow-hidden flex-shrink-0 bg-surface">
                  <Image
                    src={`https://picsum.photos/100/100?random=${item.product_id}`}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-cream font-outfit">{item.title}</p>
                  <p className="text-sm text-fog">{item.quantity}x</p>
                </div>
                <p className="text-mud">{formatPrice(item.total ?? 0)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 space-y-2 text-sm border-t border-border">
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
            <span className="font-medium text-cream font-outfit">Total</span>
            <span className="text-mud">{formatPrice(order.total ?? 0)}</span>
          </div>
        </div>

        {/* Shipping address */}
        {shippingAddress && (
          <div>
            <h3 className="font-medium mb-2 text-cream font-outfit">
              Adresă livrare
            </h3>
            <p className="text-sm text-fog">
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
    </div>
  )
}
