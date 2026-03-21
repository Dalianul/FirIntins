"use client"

import { useState } from "react"
import { m } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw new Error("Eroare la trimitere")

      toast({
        title: "Succes",
        description: "Multumim că te-ai abonat la newsletter",
      })
      setEmail("")
    } catch (error) {
      toast({
        title: "Eroare",
        description: "A apărut o problemă la trimitere",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <m.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-20 px-4 bg-surface-2 text-center"
    >
      <h2 className="font-cormorant text-5xl text-cream mb-4">
        Rămâi la curent
      </h2>
      <p className="text-fog mb-8 max-w-2xl mx-auto">
        Abonează-te la newsletter și primești oferte exclusive
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-surface border-border"
        />
        <Button type="submit" disabled={loading} className="bg-moss">
          {loading ? "Trimitere..." : "Abonează-te"}
        </Button>
      </form>
    </m.section>
  )
}
