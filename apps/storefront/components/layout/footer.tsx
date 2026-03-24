import Link from "next/link"
import { connection } from "next/server"
import { getCachedFooterPages } from "@/lib/cms/client"

export default async function Footer() {
  await connection()
  const footerPages = await getCachedFooterPages()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[--color-surface] border-t border-[--color-border] mt-16">
      {/* Main footer content */}
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
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-[--color-moss] hover:text-[--color-moss-light]">
                Facebook
              </a>
              <a href="#" className="text-[--color-moss] hover:text-[--color-moss-light]">
                Instagram
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-[--color-white] mb-4 uppercase">
              Meniu
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/produse" className="text-[--color-fog] hover:text-[--color-moss]">
                  Produse
                </Link>
              </li>
              <li>
                <Link href="/categorii" className="text-[--color-fog] hover:text-[--color-moss]">
                  Categorii
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[--color-fog] hover:text-[--color-moss]">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/cont" className="text-[--color-fog] hover:text-[--color-moss]">
                  Contul Meu
                </Link>
              </li>
            </ul>
          </div>

          {/* Informații (legal pages from CMS) */}
          {footerPages.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[--color-white] mb-4 uppercase">
                Informații
              </h4>
              <ul className="space-y-2 text-sm">
                {footerPages.map((page) => (
                  <li key={page.id}>
                    <Link
                      href={`/pagini/${page.slug}`}
                      className="text-[--color-fog] hover:text-[--color-moss]"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-[--color-white] mb-4 uppercase">
              Contact
            </h4>
            <p className="text-[--color-fog] text-sm">
              Email:{" "}
              <a href="mailto:info@firintins.ro" className="text-[--color-moss]">
                info@firintins.ro
              </a>
            </p>
            <p className="text-[--color-fog] text-sm mt-2">
              Telefon:{" "}
              <a href="tel:+40751234567" className="text-[--color-moss]">
                +40 751 234 567
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[--color-border] bg-[--color-bg]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[--color-fog]">
          <p>&copy; {currentYear} FirIntins. Toate drepturile rezervate.</p>
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
