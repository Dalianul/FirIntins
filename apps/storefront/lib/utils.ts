import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null || isNaN(price as number)) return "0,00 lei"
  return (price / 100).toLocaleString("ro-RO", {
    minimumFractionDigits: 2,
  }) + " lei"
}
