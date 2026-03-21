"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { registerAction } from "@/actions/auth"
import { registerSchema, type RegisterInput } from "@/lib/schema/auth"

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    try {
      const result = await registerAction(data)
      if (result.success) {
        const redirectUrl = searchParams.get("redirect") || "/cont"
        const isValidRedirect = redirectUrl.startsWith("/")
        toast({ title: "Bun venit", description: "Contul tău a fost creat cu succes" })
        router.push(isValidRedirect ? redirectUrl : "/cont")
      } else {
        toast({ title: "Eroare", description: result.error || "Nu am putut crea contul", variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input {...register("firstName")} type="text" placeholder="Prenume" className="bg-surface-2 border-border" />
        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
      </div>
      <div>
        <Input {...register("lastName")} type="text" placeholder="Nume" className="bg-surface-2 border-border" />
        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
      </div>
      <div>
        <Input {...register("email")} type="email" placeholder="Email" className="bg-surface-2 border-border" />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Input {...register("password")} type="password" placeholder="Parolă" className="bg-surface-2 border-border" />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>
      <div>
        <Input {...register("confirmPassword")} type="password" placeholder="Confirmare parolă" className="bg-surface-2 border-border" />
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-moss hover:bg-moss-light">
        {loading ? "Se înregistrează..." : "Înregistrare"}
      </Button>
    </form>
  )
}
