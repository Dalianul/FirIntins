import Link from "next/link"

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 1.5rem",
        textAlign: "center",
      }}
    >
      <h1
        className="font-cormorant"
        style={{ fontSize: "3.5rem", fontWeight: 600, marginBottom: "1rem" }}
      >
        Pagina nu a fost găsită
      </h1>
      <p
        style={{
          color: "var(--color-fog)",
          marginBottom: "2rem",
          maxWidth: "36rem",
        }}
      >
        Ne pare rău, pagina pe care o cauți nu există sau a fost mutată.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          className="btn-primary"
          style={{
            padding: "0.75rem 1.5rem",
            background: "var(--color-moss)",
            color: "var(--color-white)",
            textDecoration: "none",
            borderRadius: "0.375rem",
          }}
        >
          Înapoi la homepage
        </Link>
        <Link
          href="/produse"
          style={{
            padding: "0.75rem 1.5rem",
            border: "1px solid var(--color-border)",
            color: "var(--color-cream)",
            textDecoration: "none",
            borderRadius: "0.375rem",
          }}
        >
          Vezi produsele
        </Link>
      </div>
    </main>
  )
}
