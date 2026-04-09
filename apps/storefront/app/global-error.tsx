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
          background: "#f5f1ea",
          color: "#1c1a15",
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
        <p style={{ color: "#6b6359", marginBottom: "2rem" }}>
          Te rugăm să reîncarci pagina.
        </p>
        <button
          onClick={() => reset()}
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
          Reîncearcă
        </button>
      </body>
    </html>
  )
}
