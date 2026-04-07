"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

function Select(props: SelectPrimitive.Root.Props<string>) {
  return (
    <SelectPrimitive.Root data-slot="select" {...props}>
      {props.children}
    </SelectPrimitive.Root>
  )
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "inline-flex w-auto items-center justify-between gap-2 [background:var(--color-surface)] border border-[--color-fog]/20 text-sm text-[--color-fog] rounded px-3 py-1.5 focus:outline-none focus:border-[--color-moss] cursor-pointer whitespace-nowrap transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        "hover:bg-[--color-bg-light] hover:border-[--color-fog]/40 hover:text-[--color-white]",
        "aria-expanded:bg-[--color-bg-light] aria-expanded:border-[--color-moss]/60 aria-expanded:text-[--color-white]",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[--color-fog]/60" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectValue(
  props: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Popup>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={4}>
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "z-40 min-w-[var(--anchor-width,8rem)] [background:var(--color-surface)] border border-[--color-fog]/20 rounded shadow-xl py-1 outline-none",
            className
          )}
          {...props}
        >
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex items-center px-7 py-1.5 text-sm text-[--color-fog] cursor-pointer select-none outline-none",
        "hover:bg-[--color-bg-light] hover:text-[--color-white]",
        "data-[highlighted]:bg-[--color-bg-light] data-[highlighted]:text-[--color-white]",
        "data-[selected]:text-[--color-moss]",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-3 w-3 text-[--color-moss]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
