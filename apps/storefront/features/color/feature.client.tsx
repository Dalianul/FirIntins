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

function ColorPickerItem({
  editor,
}: {
  active?: boolean
  anchorElem: HTMLElement
  editor: LexicalEditor
  enabled?: boolean
  item: ToolbarGroupItem
}) {
  const [color, setColor] = useState('#000000')
  // Save last non-collapsed selection so we can restore it after the color
  // picker steals focus (Lexical clears selection on editor blur).
  const savedRange = useRef<{ anchor: SavedPoint; focus: SavedPoint } | null>(null)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const c = $getSelectionStyleValueForProperty(selection, 'color', '#000000')
          if (c) setColor(c)
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

  const applyColor = useCallback(
    (hex: string) => {
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
          $patchStyleText(selection, { color: hex })
        }
      })
    },
    [editor],
  )

  const clearColor = useCallback(() => {
    editor.update(() => {
      let selection = $getSelection()
      if ((!$isRangeSelection(selection) || selection.isCollapsed()) && savedRange.current) {
        const { anchor, focus } = savedRange.current
        const restored = $createRangeSelection()
        restored.anchor.set(anchor.key, anchor.offset, anchor.type)
        restored.focus.set(focus.key, focus.offset, focus.type)
        $setSelection(restored)
        selection = $getSelection()
      }
      if ($isRangeSelection(selection) && !selection.isCollapsed()) {
        $patchStyleText(selection, { color: '' })
      }
    })
  }, [editor])

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <input
        type="color"
        value={color}
        title="Culoare text"
        onChange={(e) => {
          const hex = e.target.value
          setColor(hex)
          if (/^#(?:[0-9a-f]{3}){1,2}$/i.test(hex)) {
            applyColor(hex)
          }
        }}
        style={{
          width: 26,
          height: 26,
          padding: 2,
          cursor: 'pointer',
          border: '1px solid var(--theme-elevation-300)',
          borderRadius: 4,
          background: 'transparent',
          flexShrink: 0,
        }}
      />
      <button
        type="button"
        title="Resetează culoarea"
        onClick={clearColor}
        style={{
          width: 18,
          height: 18,
          lineHeight: '16px',
          fontSize: 12,
          cursor: 'pointer',
          border: '1px solid var(--theme-elevation-300)',
          borderRadius: 3,
          background: 'transparent',
          color: 'var(--theme-text)',
          padding: 0,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </span>
  )
}

const colorToolbarGroup = {
  type: 'buttons' as const,
  key: 'inlineColor',
  order: 25,
  items: [
    {
      key: 'colorPicker',
      label: 'Culoare text',
      Component: ColorPickerItem,
    },
  ],
}

export const ColorFeatureClient = createClientFeature({
  toolbarFixed: { groups: [colorToolbarGroup] },
  toolbarInline: { groups: [colorToolbarGroup] },
})
