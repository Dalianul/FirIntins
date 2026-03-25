"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 1.5rem",
        textAlign: "center",
        background: "#0f0e0b",
        color: "#faf8f3",
      }}
    >
      <h2
        style={{
          fontSize: "2.5rem",
          fontFamily: "serif",
          fontWeight: 600,
          marginBottom: "1rem",
        }}
      >
        Ceva nu a funcționat
      </h2>
      <p style={{ color: "#9ca3af", marginBottom: "2rem", maxWidth: "36rem" }}>
        A apărut o eroare neașteptată. Poți încerca din nou sau reveni la homepage.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          autoFocus
          style={{
            padding: "0.75rem 1.5rem",
            background: "#4a5e3a",
            color: "#faf8f3",
            border: "none",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Încearcă din nou
        </button>
        <Link
          href="/"
          style={{
            padding: "0.75rem 1.5rem",
            border: "1px solid #374151",
            color: "#d1d5db",
            textDecoration: "none",
            borderRadius: "0.375rem",
          }}
        >
          Înapoi la homepage
        </Link>
      </div>
    </div>
  )
}
