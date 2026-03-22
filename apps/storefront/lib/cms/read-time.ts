// apps/storefront/lib/cms/read-time.ts

// Walks Lexical JSON to extract plain text, then estimates reading time.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText(node: any): string {
  if (node.type === "text" && typeof node.text === "string") return node.text
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractText).join(" ")
  }
  return ""
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calcReadTime(lexicalContent: any): number {
  if (!lexicalContent) return 1

  // Handle Lexical root structure
  const rootNode = lexicalContent.root || lexicalContent
  const text = extractText(rootNode)
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
