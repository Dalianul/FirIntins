'use client'
import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { $getSelection, $isRangeSelection } from 'lexical'
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from '@lexical/selection'
import type { LexicalEditor } from 'lexical'
import { useCallback, useEffect, useState } from 'react'
import type { ToolbarGroupItem } from '@payloadcms/richtext-lexical'

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

  // Keep input in sync with the current selection's font-size
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const size = $getSelectionStyleValueForProperty(selection, 'font-size', '')
          setFontSize(size)
        }
      })
    })
  }, [editor])

  const applyFontSize = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      if (!trimmed) return
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
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
