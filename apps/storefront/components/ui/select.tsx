"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextValue {
  value: string
  onValueChange: (v: string | null) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SelectCtx = React.createContext<SelectContextValue | null>(null)

function useSelectCtx() {
  const ctx = React.useContext(SelectCtx)
  if (!ctx) throw new Error("Select components must be wrapped in <Select>")
  return ctx
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function Select({
  value,
  onValueChange,
  children,
}: {
  value: string
  onValueChange: (v: string | null) => void
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onMouse)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onMouse)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <SelectCtx.Provider value={{ value, onValueChange, open, setOpen }}>
      <div ref={ref} data-slot="select" className="relative inline-block">
        {children}
      </div>
    </SelectCtx.Provider>
  )
}

// ─── Trigger ──────────────────────────────────────────────────────────────────

function SelectTrigger({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { open, setOpen } = useSelectCtx()

  return (
    <button
      type="button"
      data-slot="select-trigger"
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      aria-haspopup="listbox"
      className={cn(
        "inline-flex w-auto items-center justify-between gap-2",
        "[background:rgba(245,241,234,0.92)] border border-[rgba(100,92,80,0.2)]",
        "rounded-md px-3 py-1.5",
        "text-[13px] text-[--color-fog]",
        "cursor-pointer whitespace-nowrap select-none",
        "transition-all duration-150 focus:outline-none",
        "hover:border-[rgba(74,94,58,0.5)] hover:text-[--color-white]",
        open && "border-[--color-moss] text-[--color-white] shadow-[0_0_0_1px_rgba(74,94,58,0.2)]",
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-3.5 w-3.5 shrink-0 text-[--color-fog]/50 transition-transform duration-150",
          open && "rotate-180"
        )}
      />
    </button>
  )
}

// ─── Value (passthrough display) ──────────────────────────────────────────────

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useSelectCtx()
  return <span data-slot="select-value">{value || placeholder}</span>
}

// ─── Content (absolute, anchored to trigger) ──────────────────────────────────

function SelectContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { open } = useSelectCtx()

  if (!open) return null

  return (
    <div
      data-slot="select-content"
      role="listbox"
      className={cn(
        // anchored directly below trigger, full trigger width minimum
        "absolute top-full left-0 mt-1 z-50 min-w-full",
        // visual
        "p-1 outline-none",
        "[background:rgba(250,247,242,0.99)] backdrop-blur-md",
        "border border-[rgba(100,92,80,0.15)]",
        "rounded-md shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        className
      )}
    >
      {children}
    </div>
  )
}

// ─── Item ─────────────────────────────────────────────────────────────────────

function SelectItem({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: React.ReactNode
}) {
  const { value: selectedValue, onValueChange, setOpen } = useSelectCtx()
  const isSelected = value === selectedValue

  return (
    <div
      data-slot="select-item"
      role="option"
      aria-selected={isSelected}
      onClick={() => {
        onValueChange(value)
        setOpen(false)
      }}
      className={cn(
        "relative flex items-center gap-2 pl-7 pr-3 py-[7px]",
        "text-[13px] text-[--color-fog]",
        "rounded cursor-pointer select-none outline-none",
        "transition-colors duration-100",
        "hover:bg-[rgba(74,94,58,0.12)] hover:text-[--color-white]",
        isSelected && "text-[#3d5630]",
        className
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-3 w-3 text-[--color-moss]" />}
      </span>
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
