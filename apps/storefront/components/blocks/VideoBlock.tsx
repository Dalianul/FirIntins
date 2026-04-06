"use client"

import { motion } from "motion/react"

interface VideoBlockData {
  blockType: "video"
  heading?: string
  videoUrl?: string
  caption?: string
  aspectRatio?: "16/9" | "4/3" | "1/1" | "9/16"
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v")
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`
    }
    if (u.hostname === "youtu.be") {
      const v = u.pathname.slice(1)
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`
    }
    if (u.hostname.includes("vimeo.com")) {
      const v = u.pathname.split("/").filter(Boolean)[0]
      if (v) return `https://player.vimeo.com/video/${v}`
    }
  } catch {
    return null
  }
  return null
}

const paddingMap: Record<string, string> = {
  "16/9": "56.25%",
  "4/3": "75%",
  "1/1": "100%",
  "9/16": "177.78%",
}

export function VideoBlock({ block }: { block: VideoBlockData }) {
  const { heading, videoUrl, caption, aspectRatio = "16/9" } = block
  if (!videoUrl) return null

  const embedUrl = getEmbedUrl(videoUrl)
  if (!embedUrl) return null

  const paddingBottom = paddingMap[aspectRatio] ?? "56.25%"

  return (
    <section className="py-16 px-6 sm:px-10 bg-[--color-bg]">
      <div className="max-w-4xl mx-auto">
        {heading && (
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="font-cormorant text-4xl text-[--color-white]">{heading}</h2>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="border border-[--color-border]"
        >
          <div className="relative w-full" style={{ paddingBottom }}>
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={heading ?? "Video"}
            />
          </div>
        </motion.div>

        {caption && (
          <p className="text-[--color-fog] text-sm font-outfit text-center mt-4">{caption}</p>
        )}
      </div>
    </section>
  )
}
