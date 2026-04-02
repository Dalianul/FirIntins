"use client"

import { useState, useEffect } from "react"

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
          <button
            onClick={decline}
            className="px-4 py-2 text-sm border border-border text-fog rounded hover:border-moss hover:text-cream transition-colors"
          >
            Refuz
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-moss text-white rounded hover:bg-moss-light transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
