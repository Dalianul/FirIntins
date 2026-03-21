import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return (price / 100).toLocaleString("ro-RO", {
    minimumFractionDigits: 2,
  }) + " lei"
}
