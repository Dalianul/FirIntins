import { ImageResponse } from "next/og"
import { getPost } from "@/lib/cms/client"

export const alt = "Articol FirIntins Blog"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

type Props = { params: Promise<{ slug: string }> }

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
  const { slug } = await params

  const post = await getPost(slug).catch(() => null)
  if (!post) return fallback()

  const coverUrl =
    post.coverImage?.url &&
    !post.coverImage.url.startsWith("http://localhost")
      ? (() => {
          try {
            return new URL(post.coverImage!.url!).href
          } catch {
            return null
          }
        })()
      : null

  const categoryName =
    typeof post.category === "object" ? post.category?.name : null

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
      {coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
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
      <div
        style={{
          position: "relative",
          padding: "40px 48px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {categoryName && (
          <span
            style={{
              background: "#4a5e3a",
              color: "#faf8f3",
              fontSize: 18,
              padding: "4px 12px",
              borderRadius: 4,
              alignSelf: "flex-start",
            }}
          >
            {categoryName}
          </span>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              color: "#faf8f3",
              fontSize: 46,
              fontFamily: fontData ? "Cormorant" : "serif",
              fontWeight: 600,
              maxWidth: "78%",
              lineHeight: 1.2,
            }}
          >
            {post.title}
          </span>
          <span
            style={{
              color: "#faf8f3",
              fontSize: 20,
              fontFamily: "serif",
              opacity: 0.8,
            }}
          >
            FirIntins Blog
          </span>
        </div>
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
