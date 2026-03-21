"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { loginAction } from "@/actions/auth"
import { loginSchema, type LoginInput } from "@/lib/schema/auth"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    try {
      const result = await loginAction(data)
      if (result.success) {
        const redirectUrl = searchParams.get("redirect") || "/cont"
        const isValidRedirect = redirectUrl.startsWith("/")
        toast({ title: "Bun venit", description: "Ai fost conectat cu succes" })
        router.push(isValidRedirect ? redirectUrl : "/cont")
      } else {
        toast({ title: "Eroare", description: result.error || "Nu am putut conecta", variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input {...register("email")} type="email" placeholder="Email" className="bg-surface-2 border-border" />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Input {...register("password")} type="password" placeholder="Parolă" className="bg-surface-2 border-border" />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-moss hover:bg-moss-light">
        {loading ? "Se conectează..." : "Conectare"}
      </Button>
    </form>
  )
}
