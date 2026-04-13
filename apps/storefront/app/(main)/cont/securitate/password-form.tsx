"use client"

import { useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { updatePasswordAction } from "@/actions/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ActionState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
} | null

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} variant="brand" size="heroInline">
      {pending ? "Se salvează..." : "Actualizează parola"}
    </Button>
  )
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return <p className="text-red-400 text-xs mt-1">{errors[0]}</p>
}

export function PasswordForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updatePasswordAction,
    null
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state?.success])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state?.success && (
        <p className="text-moss text-sm bg-moss/10 px-4 py-2 rounded">
          Parola a fost actualizată.
        </p>
      )}
      {state?.error && (
        <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded">
          {state.error}
        </p>
      )}

      <div>
        <label className="block text-fog text-sm mb-1" htmlFor="password">
          Parolă nouă
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
        />
        <FieldError errors={state?.fieldErrors?.password} />
      </div>

      <div>
        <label className="block text-fog text-sm mb-1" htmlFor="confirmPassword">
          Confirmă parola
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
        />
        <FieldError errors={state?.fieldErrors?.confirmPassword} />
      </div>

      <SubmitButton />
    </form>
  )
}
