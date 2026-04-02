import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Înregistrare — FirIntins",
  robots: { index: false, follow: false },
}

export default function RegisterPage() {
  return (
    <main className="bg-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="font-cormorant text-4xl text-cream mb-2 text-center">Înregistrare</h1>
        <p className="text-fog text-center mb-8">Creează-ți contul FirIntins</p>
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
        <p className="text-center text-fog mt-6">Ai deja cont?{" "}
          <Link href="/login" className="text-moss hover:text-moss-light">Conectează-te</Link>
        </p>
      </div>
    </main>
  )
}
