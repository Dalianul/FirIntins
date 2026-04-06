import type { Metadata } from "next"
import { connection } from "next/server"
import { BASE_URL } from "@/lib/constants"
import { getCachedHomepage } from "@/lib/cms/client"
import { BlockRenderer } from "@/components/blocks/BlockRenderer"
import { RefreshOnPreviewMessage } from "@/components/cms/RefreshOnPreviewMessage"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "FirIntins — Echipamente pescuit la crap",
  description: "Lansete, muliete și accesorii de pescuit la crap premium",
  alternates: { canonical: `${BASE_URL}/` },
  openGraph: {
    title: "FirIntins",
    description: "Echipamente premium de pescuit la crap",
    url: `${BASE_URL}/`,
    images: [{ url: `${BASE_URL}/og-default.jpg` }],
  },
}

export default async function HomePage() {
  await connection()
  let blocks: any[] = []
  try {
    const homepage = await getCachedHomepage()
    blocks = (homepage?.blocks ?? []) as any[]
  } catch {
    // CMS unavailable on first load after HMR restart — render empty shell
  }

  return (
    <main className="bg-bg">
      {/* Triggers router.refresh() on Payload live-preview postMessage events */}
      <RefreshOnPreviewMessage />
      <BlockRenderer blocks={blocks} />
    </main>
  )
}
