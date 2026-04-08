"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { ChevronDown, Check } from "lucide-react"
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
        // base
        "group inline-flex w-auto items-center justify-between gap-2",
        "[background:rgba(26,24,20,0.7)] border border-[rgba(196,191,176,0.15)]",
        "rounded-md px-3 py-1.5",
        "text-[13px] text-[--color-fog]",
        "cursor-pointer whitespace-nowrap select-none",
        "transition-all duration-150",
        "focus:outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // hover
        "hover:border-[rgba(74,94,58,0.5)] hover:text-[--color-white]",
        // open state (Base UI sets aria-expanded on trigger)
        "aria-expanded:border-[--color-moss] aria-expanded:text-[--color-white]",
        "aria-expanded:[box-shadow:0_0_0_1px_rgba(74,94,58,0.2)]",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-[--color-fog]/50 transition-transform duration-150",
            "group-aria-expanded:rotate-180"
          )}
        />
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
      <SelectPrimitive.Positioner sideOffset={4} keepMounted>
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            // layout
            "z-50 min-w-[var(--anchor-width,8rem)] p-1 outline-none",
            // glass background
            "[background:rgba(22,20,16,0.98)] backdrop-blur-md",
            "border border-[rgba(196,191,176,0.12)]",
            "rounded-md shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
            // animation — Base UI sets data-open / data-closed
            "origin-top transition-[opacity,transform] duration-150 ease-out",
            "data-[closed]:opacity-0 data-[closed]:scale-y-95 data-[closed]:pointer-events-none",
            "data-[open]:opacity-100 data-[open]:scale-y-100",
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
        // layout — left padding leaves room for check icon
        "relative flex items-center gap-2 pl-7 pr-3 py-[7px]",
        "text-[13px] text-[--color-fog]",
        "rounded cursor-pointer select-none outline-none",
        "transition-colors duration-100",
        // hover / highlighted
        "hover:bg-[rgba(74,94,58,0.12)] hover:text-[--color-white]",
        "data-[highlighted]:bg-[rgba(74,94,58,0.12)] data-[highlighted]:text-[--color-white]",
        // selected
        "data-[selected]:text-[#6b8a52]",
        className
      )}
      {...props}
    >
      {/* Check indicator — only shows when selected */}
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
