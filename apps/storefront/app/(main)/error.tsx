"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg px-6">
      <div className="text-center">
        <h1 className="font-cormorant text-7xl font-bold text-[#1c1a15] mb-6">
          Oops!
        </h1>

        <p className="font-outfit text-fog text-lg mb-8 max-w-md">
          Ceva nu a funcționat corect. Vă rugăm să încercați din nou.
        </p>

        {error.digest && (
          <p className="font-outfit text-mud text-sm mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="brand" size="heroInline">
            Încearcă din nou
          </Button>

          <Link href="/">
            <Button variant="brandOutline" size="heroInline">
              Acasă
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
