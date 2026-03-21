import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[--color-bg] px-6">
      <div className="text-center">
        <h1 className="font-cormorant text-9xl font-bold text-[--color-cream] mb-6">
          404
        </h1>

        <p className="font-outfit text-[--color-fog] text-lg mb-12 max-w-md">
          Pagina nu a fost găsită. Poate că s-a mutat sau nu mai există.
        </p>

        <Link
          href="/"
          className="inline-block px-8 py-3 bg-[--color-moss] text-[--color-cream] font-outfit font-medium rounded-lg hover:bg-[--color-moss-light] transition-colors duration-200"
        >
          Înapoi la acasă
        </Link>
      </div>
    </div>
  )
}
