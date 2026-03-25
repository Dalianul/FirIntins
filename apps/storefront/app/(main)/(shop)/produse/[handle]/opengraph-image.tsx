import { ImageResponse } from "next/og"
import { getProduct } from "@/lib/medusa/queries"

export const runtime = "edge"
export const alt = "Produs FirIntins"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

type Props = { params: Promise<{ handle: string }> }

const FONT_URL =
  "https://fonts.gstatic.com/s/cormorantgaramond/v22/kBRVjr_0Jfl6HWGlSIGVWkOdcVEtF7I.woff2"

const fallback = () =>
  new ImageResponse(
    <div
      style={{
        background: "#0f0e0b",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ color: "#faf8f3", fontSize: 48, fontFamily: "serif" }}>
        FirIntins
      </span>
    </div>,
    { width: 1200, height: 630 }
  )

export default async function OGImage({ params }: Props) {
  const { handle } = await params

  const product = await getProduct(handle).catch(() => null)
  if (!product) return fallback()

  // Skip localhost image URLs in Edge Runtime (not accessible remotely)
  const thumbnail =
    product.thumbnail &&
    !product.thumbnail.startsWith("http://localhost")
      ? product.thumbnail
      : null

  const fontRes = await fetch(FONT_URL).catch(() => null)
  const fontData = fontRes?.ok ? await fontRes.arrayBuffer() : null

  return new ImageResponse(
    <div
      style={{
        background: "#0f0e0b",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        position: "relative",
      }}
    >
      {thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
        }}
      />
      {/* Text */}
      <div
        style={{
          position: "relative",
          padding: "40px 48px",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <span
          style={{
            color: "#faf8f3",
            fontSize: 48,
            fontFamily: fontData ? "Cormorant" : "serif",
            fontWeight: 600,
            maxWidth: "80%",
            lineHeight: 1.2,
          }}
        >
          {product.title}
        </span>
        <span
          style={{
            color: "#faf8f3",
            fontSize: 20,
            fontFamily: "serif",
            opacity: 0.8,
          }}
        >
          FirIntins
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: fontData
        ? [{ name: "Cormorant", data: fontData, style: "normal" }]
        : [],
    }
  )
}
