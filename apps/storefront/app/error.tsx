"use client"

import { useEffect } from "react"
import Link from "next/link"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[--color-bg] px-6">
      <div className="text-center">
        <h1 className="font-cormorant text-7xl font-bold text-[--color-cream] mb-6">
          Oops!
        </h1>

        <p className="font-outfit text-[--color-fog] text-lg mb-8 max-w-md">
          Ceva nu a funcționat corect. Vă rugăm să încercați din nou.
        </p>

        {error.digest && (
          <p className="font-outfit text-[--color-mud] text-sm mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[--color-moss] text-[--color-cream] font-outfit font-medium rounded-lg hover:bg-[--color-moss-light] transition-colors duration-200"
          >
            Încearcă din nou
          </button>

          <Link
            href="/"
            className="px-6 py-3 bg-[--color-mud] text-[--color-cream] font-outfit font-medium rounded-lg hover:bg-[--color-mud]/80 transition-colors duration-200"
          >
            Acasă
          </Link>
        </div>
      </div>
    </div>
  )
}
