import React from 'react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

/**
 * Converts a CSS string (as stored by $patchStyleText in node.style)
 * to a React CSSProperties object.
 * Example: "color: #ff0000; font-size: 18px;" → { color: '#ff0000', fontSize: '18px' }
 */
export function cssStringToReactStyle(cssString: string): React.CSSProperties {
  if (!cssString) return {}
  return cssString
    .split(';')
    .reduce<React.CSSProperties>((acc, rule) => {
      const colonIdx = rule.indexOf(':')
      if (colonIdx === -1) return acc
      const prop = rule.slice(0, colonIdx).trim()
      const val = rule.slice(colonIdx + 1).trim()
      if (!prop || !val) return acc
      // Convert kebab-case to camelCase: font-size → fontSize
      const key = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
      ;(acc as Record<string, string>)[key] = val
      return acc
    }, {})
}

/**
 * Custom JSX converters for <RichText>.
 * Extends the default text converter to apply inline styles
 * stored in node.style by $patchStyleText (color picker, font-size input).
 */
// JSXConverter is typed as `((args) => ReactNode) | ReactNode` — check before calling
function callDefaultText(
  defaultText: unknown,
  args: Parameters<Exclude<Parameters<JSXConvertersFunction>[0]['defaultConverters']['text'], React.ReactNode>>[0],
  fallback: React.ReactNode,
): React.ReactNode {
  if (typeof defaultText === 'function') return defaultText(args)
  if (defaultText != null) return defaultText as React.ReactNode
  return fallback
}

/**
 * Custom JSX converters for <RichText>.
 * Extends the default text converter to apply inline styles
 * stored in node.style by $patchStyleText (color picker, font-size input).
 */
export const richTextConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  text: (args) => {
    const { node } = args
    const nodeStyle = (node as { style?: string }).style
    const fallback = <>{node.text}</>

    // No inline style — use default converter as-is
    if (!nodeStyle || typeof nodeStyle !== 'string') {
      return callDefaultText(defaultConverters.text, args, fallback)
    }

    const style = cssStringToReactStyle(nodeStyle)
    if (Object.keys(style).length === 0) {
      return callDefaultText(defaultConverters.text, args, fallback)
    }

    // Render the default content (bold, italic, etc.) then wrap in a styled span
    const defaultContent = callDefaultText(defaultConverters.text, args, fallback)
    return <span style={style}>{defaultContent}</span>
  },
})
