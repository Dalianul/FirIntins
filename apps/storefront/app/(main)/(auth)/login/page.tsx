import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Autentificare — FirIntins",
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <main className="bg-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="font-cormorant text-4xl text-cream mb-2 text-center">Conectare</h1>
        <p className="text-fog text-center mb-8">Accesează contul tău FirIntins</p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-fog mt-6">Nu ai cont?{" "}
          <Link href="/register" className="text-moss hover:text-moss-light">Înregistrează-te</Link>
        </p>
      </div>
    </main>
  )
}
