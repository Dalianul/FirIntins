'use client'
import { createClientFeature } from '@/lib/cms/create-client-feature'
import {
  $getSelection,
  $isRangeSelection,
  $createRangeSelection,
  $setSelection,
} from 'lexical'
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from '@lexical/selection'
import type { LexicalEditor, PointType } from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ToolbarGroupItem } from '@payloadcms/richtext-lexical'

interface SavedPoint {
  key: string
  offset: number
  type: PointType['type']
}

function FontSizeItem({
  editor,
}: {
  active?: boolean
  anchorElem: HTMLElement
  editor: LexicalEditor
  enabled?: boolean
  item: ToolbarGroupItem
}) {
  const [fontSize, setFontSize] = useState('')
  // Save last non-collapsed selection so we can restore it after the input
  // steals focus (Lexical clears selection on editor blur).
  const savedRange = useRef<{ anchor: SavedPoint; focus: SavedPoint } | null>(null)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const size = $getSelectionStyleValueForProperty(selection, 'font-size', '')
          setFontSize(size)
          if (!selection.isCollapsed()) {
            savedRange.current = {
              anchor: { key: selection.anchor.key, offset: selection.anchor.offset, type: selection.anchor.type },
              focus: { key: selection.focus.key, offset: selection.focus.offset, type: selection.focus.type },
            }
          }
        }
      })
    })
  }, [editor])

  const applyFontSize = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      if (!trimmed) return
      if (!/^(\d+(?:\.\d+)?)(px|rem|em|%|pt|ch|ex|vw|vh|vmin|vmax)$/.test(trimmed)) return
      editor.update(() => {
        let selection = $getSelection()
        // Restore saved selection if editor lost focus (selection is null or collapsed)
        if ((!$isRangeSelection(selection) || selection.isCollapsed()) && savedRange.current) {
          const { anchor, focus } = savedRange.current
          const restored = $createRangeSelection()
          restored.anchor.set(anchor.key, anchor.offset, anchor.type)
          restored.focus.set(focus.key, focus.offset, focus.type)
          $setSelection(restored)
          selection = $getSelection()
        }
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          $patchStyleText(selection, { 'font-size': trimmed })
        }
      })
    },
    [editor],
  )

  return (
    <input
      type="text"
      value={fontSize}
      placeholder="18px"
      title="Dimensiune font"
      onChange={(e) => setFontSize(e.target.value)}
      onBlur={(e) => applyFontSize(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          applyFontSize(fontSize)
        }
      }}
      style={{
        width: 72,
        height: 26,
        padding: '0 6px',
        border: '1px solid var(--theme-elevation-300)',
        borderRadius: 4,
        fontSize: 12,
        background: 'var(--theme-elevation-50)',
        color: 'var(--theme-text)',
        flexShrink: 0,
      }}
    />
  )
}

const fontSizeToolbarGroup = {
  type: 'buttons' as const,
  key: 'inlineFontSize',
  order: 26,
  items: [
    {
      key: 'fontSizeInput',
      label: 'Dimensiune font',
      Component: FontSizeItem,
    },
  ],
}

export const FontSizeFeatureClient = createClientFeature({
  toolbarFixed: { groups: [fontSizeToolbarGroup] },
  toolbarInline: { groups: [fontSizeToolbarGroup] },
})
