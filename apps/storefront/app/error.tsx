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
        background: "#f5f1ea",
        color: "#1c1a15",
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
      <p style={{ color: "#6b6359", marginBottom: "2rem", maxWidth: "36rem" }}>
        A apărut o eroare neașteptată. Poți încerca din nou sau reveni la homepage.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          autoFocus
          style={{
            padding: "0.75rem 1.5rem",
            background: "#3d5630",
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
            border: "1px solid #d4cdbf",
            color: "#3d3630",
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
