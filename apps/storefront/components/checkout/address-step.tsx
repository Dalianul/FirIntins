"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { addressSchema, type AddressInput } from "@/lib/schema/checkout"
import { updateAddressAction } from "@/actions/checkout"

interface AddressStepProps {
  cartId: string
  onNext: () => void
}

export function AddressStep({ cartId, onNext }: AddressStepProps) {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { countryCode: "ro" },
  })

  const onSubmit = async (data: AddressInput) => {
    const result = await updateAddressAction(cartId, data)
    if (result.success) {
      onNext()
    } else {
      toast({
        title: "Eroare",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="font-outfit font-medium text-cream text-xl mb-4">Adresă livrare</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input placeholder="Prenume" {...register("firstName")} />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <Input placeholder="Nume" {...register("lastName")} />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
        </div>
      </div>
      <div>
        <Input placeholder="Adresă" {...register("address1")} />
        {errors.address1 && <p className="text-red-500 text-xs mt-1">{errors.address1.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input placeholder="Oraș" {...register("city")} />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <Input placeholder="Cod poștal" {...register("postalCode")} />
          {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
        </div>
      </div>
      <div>
        <Input placeholder="Telefon (opțional)" {...register("phone")} />
      </div>
      <div>
        <Input
          placeholder="Cod fiscal (CUI) — opțional"
          {...register("cui")}
        />
      </div>
      <input type="hidden" {...register("countryCode")} value="ro" />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-moss hover:bg-moss-light"
      >
        {isSubmitting ? "Se procesează..." : "Continuă la livrare"}
      </Button>
    </form>
  )
}
