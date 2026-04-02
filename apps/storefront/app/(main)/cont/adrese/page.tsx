import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { medusa } from "@/lib/medusa/client"
import { AddAddressSheet, EditAddressSheet } from "./address-sheet"
import { deleteAddressAction, setDefaultAddressAction } from "@/actions/account"

export default async function AddressesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) redirect("/autentificare")

  try {
    const { customer } = await medusa.store.customer.retrieve(undefined, {
      Authorization: `Bearer ${token}`,
    })

    const addresses = (customer.addresses ?? []) as Array<{
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
      is_default_shipping?: boolean
    }>

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-cormorant text-3xl text-cream mb-1">Adresele mele</h2>
            <p className="text-fog text-sm">Gestionează adresele de livrare.</p>
          </div>
          <AddAddressSheet />
        </div>

        {addresses.length === 0 ? (
          <div className="bg-surface-2 rounded p-6 text-fog text-sm">
            Nu ai adrese salvate.
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-surface-2 rounded p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    {addr.is_default_shipping && (
                      <span className="inline-block text-xs bg-moss/20 text-moss px-2 py-0.5 rounded mb-1">
                        Implicită
                      </span>
                    )}
                    <p className="text-cream text-sm font-medium">
                      {addr.first_name} {addr.last_name}
                    </p>
                    <p className="text-fog text-sm">{addr.address_1}</p>
                    {addr.address_2 && (
                      <p className="text-fog text-sm">{addr.address_2}</p>
                    )}
                    <p className="text-fog text-sm">
                      {addr.city}, {addr.province} {addr.postal_code}
                    </p>
                    <p className="text-fog text-sm uppercase">{addr.country_code}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    <EditAddressSheet address={addr} />

                    {!addr.is_default_shipping && (
                      <>
                        <form action={setDefaultAddressAction as any}>
                          <input type="hidden" name="addressId" value={addr.id} />
                          <button
                            type="submit"
                            className="text-fog hover:text-cream text-xs underline"
                          >
                            Setează ca implicită
                          </button>
                        </form>

                        <form action={deleteAddressAction as any}>
                          <input type="hidden" name="addressId" value={addr.id} />
                          <button
                            type="submit"
                            className="text-red-400 hover:text-red-300 text-xs underline"
                          >
                            Șterge
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  } catch {
    redirect("/autentificare")
  }
}
