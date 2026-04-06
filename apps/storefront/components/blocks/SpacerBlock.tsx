interface SpacerBlockData {
  blockType: "spacer"
  size?: "sm" | "md" | "lg" | "xl"
  showDivider?: boolean
}

const sizeMap: Record<string, string> = {
  sm: "h-8",
  md: "h-16",
  lg: "h-24",
  xl: "h-32",
}

export function SpacerBlock({ block }: { block: SpacerBlockData }) {
  const { size = "md", showDivider = false } = block
  const heightClass = sizeMap[size] ?? sizeMap.md

  return (
    <div className={`${heightClass} flex items-center justify-center px-6 sm:px-10`}>
      {showDivider && (
        <div className="w-full max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex-1 border-t border-[--color-border]" />
          <div className="w-1 h-1 rounded-full bg-[--color-moss]/40" />
          <div className="flex-1 border-t border-[--color-border]" />
        </div>
      )}
    </div>
  )
}
