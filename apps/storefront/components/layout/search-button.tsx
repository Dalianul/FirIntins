"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, m } from "motion/react"
import { Search, X } from "lucide-react"

export default function SearchButton() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  function handleOpen() {
    setValue(searchParams.get("q") ?? "")
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    setValue("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (value.trim()) {
      router.push("/produse?q=" + encodeURIComponent(value.trim()))
    } else {
      router.push("/produse")
    }
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") handleClose()
  }

  return (
    <AnimatePresence mode="wait">
      {open ? (
        <m.form
          key="search-open"
          role="form"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit}
          className="flex items-center gap-2"
        >
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Caută produse..."
            className="bg-[--color-surface] border border-[--color-moss]/40 rounded px-3 py-1.5 text-sm text-[--color-cream] placeholder:text-[--color-fog]/40 focus:outline-none focus:border-[--color-moss] w-48"
          />
          <m.button
            type="button"
            onClick={handleClose}
            className="text-[--color-fog] hover:text-[--color-cream] transition-colors"
            aria-label="Închide căutarea"
          >
            <X size={18} />
          </m.button>
        </m.form>
      ) : (
        <m.button
          key="search-closed"
          type="button"
          onClick={handleOpen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-[--color-cream] hover:text-[--color-moss] transition-colors"
          aria-label="Caută"
        >
          <Search size={18} />
        </m.button>
      )}
    </AnimatePresence>
  )
}
