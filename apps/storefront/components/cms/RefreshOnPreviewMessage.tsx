'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Listens for Payload live-preview postMessage events and triggers a full
 * router refresh so server components re-fetch the latest draft data.
 *
 * Used on pages whose blocks include server-only async components
 * (e.g. FeaturedProductsBlock fetching from Medusa) where a client-side
 * useLivePreview wrapper is not viable.
 */
export function RefreshOnPreviewMessage() {
  const router = useRouter()

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // Payload sends { type: 'payload-live-preview', ... } messages
      if (event.data?.type === 'payload-live-preview') {
        router.refresh()
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [router])

  return null
}
