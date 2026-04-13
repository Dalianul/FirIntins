"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent")
    if (!accepted) setVisible(true)
  }, [])

  if (!visible) return null

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined")
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <p className="text-fog text-sm">
          Folosim cookie-uri pentru a îmbunătăți experiența dvs. pe site.{" "}
          <a href="/pagini/politica-cookie" className="text-moss hover:underline">
            Află mai mult
          </a>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <Button onClick={decline} variant="brandOutline" size="heroInline">
            Refuz
          </Button>
          <Button onClick={accept} variant="brand" size="heroInline">
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
