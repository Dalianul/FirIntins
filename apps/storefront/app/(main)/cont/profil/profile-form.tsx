"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { updateProfileAction } from "@/actions/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Customer = {
  first_name?: string | null
  last_name?: string | null
  email: string
}

type ActionState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
} | null

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} variant="brand" size="heroInline">
      {pending ? "Se salvează..." : "Salvează modificările"}
    </Button>
  )
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return <p className="text-red-400 text-xs mt-1">{errors[0]}</p>
}

export function ProfileForm({ customer }: { customer: Customer }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateProfileAction,
    null
  )

  return (
    <form action={formAction} className="space-y-4">
      {state?.success && (
        <p className="text-moss text-sm bg-moss/10 px-4 py-2 rounded">
          Profil actualizat cu succes.
        </p>
      )}
      {state?.error && (
        <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-fog text-sm mb-1" htmlFor="firstName">
            Prenume
          </label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            defaultValue={customer.first_name ?? ""}
          />
          <FieldError errors={state?.fieldErrors?.firstName} />
        </div>

        <div>
          <label className="block text-fog text-sm mb-1" htmlFor="lastName">
            Nume
          </label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            defaultValue={customer.last_name ?? ""}
          />
          <FieldError errors={state?.fieldErrors?.lastName} />
        </div>
      </div>

      <div>
        <label className="block text-fog text-sm mb-1" htmlFor="email">
          Adresă de email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={customer.email}
        />
        <FieldError errors={state?.fieldErrors?.email} />
      </div>

      <SubmitButton />
    </form>
  )
}
