"use client"

export default function GlobalError({
  reset,
}: {
  reset: () => void
}) {
  return (
    <html lang="ro">
      <body
        style={{
          margin: 0,
          background: "#0f0e0b",
          color: "#faf8f3",
          fontFamily: "serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          Eroare critică
        </h1>
        <p style={{ color: "#9ca3af", marginBottom: "2rem" }}>
          Te rugăm să reîncarci pagina.
        </p>
        <button
          onClick={() => reset()}
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
          Reîncearcă
        </button>
      </body>
    </html>
  )
}
