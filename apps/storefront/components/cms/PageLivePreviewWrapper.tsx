'use client'
import { useLivePreview } from '@payloadcms/live-preview-react'
import { PostContent } from '@/components/blog/post-content'

const PAYLOAD_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PageLivePreviewWrapper({ initialPage }: { initialPage: any }) {
  const { data: page } = useLivePreview({
    initialData: initialPage,
    serverURL: PAYLOAD_URL,
    depth: 0,
  })

  return (
    <>
      <h1 className="font-cormorant text-3xl sm:text-4xl font-semibold text-[--color-white] mb-8">
        {page.title}
      </h1>
      <PostContent content={page.content} />
    </>
  )
}
