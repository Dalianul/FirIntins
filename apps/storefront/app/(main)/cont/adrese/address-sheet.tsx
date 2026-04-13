"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { addAddressAction, updateAddressAction } from "@/actions/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const COUNTRY_OPTIONS = [
  { code: "ro", label: "România" },
  { code: "de", label: "Germania" },
  { code: "fr", label: "Franța" },
  { code: "it", label: "Italia" },
  { code: "es", label: "Spania" },
  { code: "hu", label: "Ungaria" },
  { code: "bg", label: "Bulgaria" },
  { code: "md", label: "Moldova" },
]

type Address = {
  id: string
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country_code?: string | null
  phone?: string | null
}

type ActionState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
} | null

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} variant="brand" size="heroInline">
      {pending ? "Se salvează..." : label}
    </Button>
  )
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return <p className="text-red-400 text-xs mt-1">{errors[0]}</p>
}

function AddressForm({
  address,
  onSuccess,
}: {
  address?: Address
  onSuccess: () => void
}) {
  const action = address ? updateAddressAction : addAddressAction
  const [state, formAction] = useActionState<ActionState, FormData>(action, null)

  useEffect(() => {
    if (state?.success) onSuccess()
  }, [state?.success, onSuccess])

  return (
    <form action={formAction} className="space-y-4 mt-4">
      {state?.error && (
        <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded">
          {state.error}
        </p>
      )}

      {address && <input type="hidden" name="addressId" value={address.id} />}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-fog text-xs mb-1">Prenume *</label>
          <Input
            name="firstName"
            defaultValue={address?.first_name ?? ""}
          />
          <FieldError errors={state?.fieldErrors?.firstName} />
        </div>
        <div>
          <label className="block text-fog text-xs mb-1">Nume *</label>
          <Input
            name="lastName"
            defaultValue={address?.last_name ?? ""}
          />
          <FieldError errors={state?.fieldErrors?.lastName} />
        </div>
      </div>

      <div>
        <label className="block text-fog text-xs mb-1">Adresă *</label>
        <Input
          name="address1"
          defaultValue={address?.address_1 ?? ""}
        />
        <FieldError errors={state?.fieldErrors?.address1} />
      </div>

      <div>
        <label className="block text-fog text-xs mb-1">Adresă (linia 2)</label>
        <Input
          name="address2"
          defaultValue={address?.address_2 ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-fog text-xs mb-1">Oraș *</label>
          <Input
            name="city"
            defaultValue={address?.city ?? ""}
          />
          <FieldError errors={state?.fieldErrors?.city} />
        </div>
        <div>
          <label className="block text-fog text-xs mb-1">Județ *</label>
          <Input
            name="province"
            defaultValue={address?.province ?? ""}
          />
          <FieldError errors={state?.fieldErrors?.province} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-fog text-xs mb-1">Cod poștal *</label>
          <Input
            name="postalCode"
            defaultValue={address?.postal_code ?? ""}
          />
          <FieldError errors={state?.fieldErrors?.postalCode} />
        </div>
        <div>
          <label className="block text-fog text-xs mb-1">Țară *</label>
          <select
            name="countryCode"
            defaultValue={address?.country_code ?? "ro"}
            className="w-full bg-bg border border-border rounded px-3 py-2 text-[#1c1a15] text-sm focus:outline-none focus:border-moss"
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <FieldError errors={state?.fieldErrors?.countryCode} />
        </div>
      </div>

      <div>
        <label className="block text-fog text-xs mb-1">Telefon</label>
        <Input
          name="phone"
          type="tel"
          defaultValue={address?.phone ?? ""}
        />
      </div>

      <SubmitButton label={address ? "Salvează adresa" : "Adaugă adresa"} />
    </form>
  )
}

export function AddAddressSheet() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center justify-center h-11 px-6 py-3.5 bg-moss text-[#ffffff] font-outfit text-[12px] uppercase tracking-[0.1em] hover:bg-moss-light transition-colors">
        + Adaugă adresă nouă
      </SheetTrigger>
      <SheetContent side="right" className="bg-surface-2 border-border w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-cormorant text-2xl text-[#1c1a15]">
            Adresă nouă
          </SheetTitle>
        </SheetHeader>
        <AddressForm onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

export function EditAddressSheet({ address }: { address: Address }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="text-fog hover:text-[#1c1a15] text-xs underline transition-colors"
        aria-label="Editează adresa"
      >
        Editează
      </SheetTrigger>
      <SheetContent side="right" className="bg-surface-2 border-border w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-cormorant text-2xl text-[#1c1a15]">
            Editează adresa
          </SheetTitle>
        </SheetHeader>
        <AddressForm address={address} onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
