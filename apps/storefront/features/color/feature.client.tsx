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

  // Keep input in sync with the current selection's color
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const c = $getSelectionStyleValueForProperty(selection, 'color', '#000000')
          if (c) setColor(c)
        }
      })
    })
  }, [editor])

  const applyColor = useCallback(
    (hex: string) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { color: hex })
        }
      })
    },
    [editor],
  )

  return (
    <input
      type="color"
      value={color}
      title="Culoare text"
      onChange={(e) => {
        setColor(e.target.value)
        applyColor(e.target.value)
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
