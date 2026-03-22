import type { Metadata } from "next"
import type { ReactNode } from "react"
import { AccountNav } from "@/components/account/account-nav"

export const metadata: Metadata = {
  title: "Contul meu | Fir Intins",
  robots: { index: false },
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-bg min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-8">
          <AccountNav />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </main>
  )
}
