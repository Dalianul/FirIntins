"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/actions/account"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await logoutAction()
    router.push("/")
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="w-full border-border"
    >
      Deconectare
    </Button>
  )
}
