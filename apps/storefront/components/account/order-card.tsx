import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: string
  status: string
  created_at: string | Date
  total: number | null
}

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
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
    <Link href={`/cont/comenzi/${order.id}`}>
      <div className="p-4 bg-surface-2 rounded border border-border hover:border-moss transition-colors cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-outfit font-medium text-cream">#{order.id.slice(0, 8)}</p>
            <p className="text-fog text-sm">
              {new Date(order.created_at).toLocaleDateString("ro-RO")}
            </p>
          </div>
          <Badge className={statusColor[order.status] ?? ""}>
            {statusMap[order.status] ?? order.status}
          </Badge>
        </div>
        <p className="text-mud font-cormorant text-lg">
          {formatPrice(order.total ?? 0)}
        </p>
      </div>
    </Link>
  )
}
