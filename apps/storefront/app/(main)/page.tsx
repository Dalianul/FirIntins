import type { Metadata } from "next"
import { connection } from "next/server"
import { BASE_URL } from "@/lib/constants"
import { getCachedHomepage } from "@/lib/cms/client"
import { BlockRenderer } from "@/components/blocks/BlockRenderer"

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
  const homepage = await getCachedHomepage()
  const blocks = homepage?.blocks ?? []

  return (
    <main className="bg-bg">
      <BlockRenderer blocks={blocks as any} />
    </main>
  )
}
