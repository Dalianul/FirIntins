import Link from "next/link"
import { connection } from "next/server"
import { getCachedFooter, getCachedSiteSettings } from "@/lib/cms/client"
import { RichText } from "@payloadcms/richtext-lexical/react"

export default async function Footer() {
  await connection()

  let columns: Array<{ heading: string; links: Array<{ label: string; url: string }> }> = []
  let legalText: unknown = null
  let socialLinks: Array<{ platform?: string | null; url?: string | null }> = []
  let phone = "+40 751 234 567"
  let email = "info@firintins.ro"

  try {
    const [footer, settings] = await Promise.all([
      getCachedFooter(),
      getCachedSiteSettings(),
    ])
    columns = (footer?.columns ?? []) as typeof columns
    legalText = footer?.legalText ?? null
    socialLinks = (settings?.socialLinks ?? []) as typeof socialLinks
    if (settings?.phone) phone = settings.phone
    if (settings?.email) email = settings.email
  } catch {
    // use hardcoded fallbacks above
  }

  const currentYear = new Date().getFullYear()

  const PLATFORM_LABELS: Record<string, string> = {
    facebook: "Facebook", instagram: "Instagram", youtube: "YouTube",
    tiktok: "TikTok", x: "X",
  }

  return (
    <footer className="bg-[--color-surface] border-t border-[--color-border] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold font-cormorant text-[--color-white] mb-4">
              FirIntins
            </h3>
            <p className="text-[--color-fog] text-sm">
              E-commerce ultra-premium echipamente pescuit la crap în România.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-4 mt-4 flex-wrap">
                {socialLinks.map((link, i) => (
                  link.url && (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[--color-moss] hover:text-[--color-moss-light] text-sm"
                    >
                      {PLATFORM_LABELS[link.platform ?? ""] ?? link.platform}
                    </a>
                  )
                ))}
              </div>
            )}
          </div>

          {/* CMS-driven columns */}
          {columns.map((col, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold text-[--color-white] mb-4 uppercase">
                {col.heading}
              </h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.url} className="text-[--color-fog] hover:text-[--color-moss]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact fallback if no columns */}
          {columns.length === 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[--color-white] mb-4 uppercase">Contact</h4>
              <p className="text-[--color-fog] text-sm">
                Email:{" "}
                <a href={`mailto:${email}`} className="text-[--color-moss]">{email}</a>
              </p>
              <p className="text-[--color-fog] text-sm mt-2">
                Telefon:{" "}
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-[--color-moss]">{phone}</a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[--color-border] bg-[--color-bg]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[--color-fog]">
          {legalText ? (
            <div className="prose prose-sm prose-invert">
              <RichText data={legalText as any} />
            </div>
          ) : (
            <p>&copy; {currentYear} FirIntins. Toate drepturile rezervate.</p>
          )}
          <div className="flex gap-4">
            <Link href="/pagini/gdpr" className="hover:text-[--color-moss]">
              Politica de Confidențialitate
            </Link>
            <Link href="/pagini/termeni-si-conditii" className="hover:text-[--color-moss]">
              Termeni și Condiții
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
