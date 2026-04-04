import React from 'react'
import { render, screen } from '@testing-library/react'
import { cssStringToReactStyle, richTextConverters } from '@/lib/cms/rich-text-converters'

// Helper: build the text converter from richTextConverters with a simple default
function buildTextConverter(defaultText?: (args: { node: { text: string } }) => React.ReactNode) {
  const defaultConverters = {
    text: defaultText ?? ((args: { node: { text: string } }) => <>{args.node.text}</>),
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const converters = richTextConverters({ defaultConverters: defaultConverters as any, data: null as any })
  return converters.text as (args: { node: { text: string; style?: string } }) => React.ReactNode
}

describe('richTextConverters — text converter', () => {
  it('falls back to default converter when node.style is absent', () => {
    const textConverter = buildTextConverter()
    const result = textConverter({ node: { text: 'hello' } })
    render(<>{result}</>)
    expect(screen.getByText('hello')).toBeInTheDocument()
    expect(document.querySelector('span[style]')).toBeNull()
  })

  it('falls back to default converter when node.style is empty string', () => {
    const textConverter = buildTextConverter()
    const result = textConverter({ node: { text: 'world', style: '' } })
    render(<>{result}</>)
    expect(screen.getByText('world')).toBeInTheDocument()
    expect(document.querySelector('span[style]')).toBeNull()
  })

  it('wraps styled text in a span with inline style', () => {
    const textConverter = buildTextConverter()
    const result = textConverter({ node: { text: 'colored', style: 'color: #ff0000' } })
    render(<>{result}</>)
    const span = document.querySelector('span[style]')
    expect(span).not.toBeNull()
    expect(span).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(span).toHaveTextContent('colored')
  })

  it('applies font-size style correctly', () => {
    const textConverter = buildTextConverter()
    const result = textConverter({ node: { text: 'big', style: 'font-size: 24px' } })
    render(<>{result}</>)
    const span = document.querySelector('span[style]')
    expect(span).not.toBeNull()
    expect(span).toHaveStyle({ fontSize: '24px' })
  })

  it('falls back when defaultConverters.text is null', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const converters = richTextConverters({ defaultConverters: { text: null } as any, data: null as any })
    const textConverter = converters.text as (args: { node: { text: string; style?: string } }) => React.ReactNode
    const result = textConverter({ node: { text: 'safe', style: 'color: red' } })
    render(<>{result}</>)
    expect(screen.getByText('safe')).toBeInTheDocument()
  })

  it('falls back when CSS string produces no valid properties', () => {
    const textConverter = buildTextConverter()
    const result = textConverter({ node: { text: 'plain', style: ';;;' } })
    render(<>{result}</>)
    expect(screen.getByText('plain')).toBeInTheDocument()
    expect(document.querySelector('span[style]')).toBeNull()
  })
})

describe('cssStringToReactStyle', () => {
  it('returns empty object for empty string', () => {
    expect(cssStringToReactStyle('')).toEqual({})
  })

  it('converts a single color property', () => {
    expect(cssStringToReactStyle('color: #ff0000')).toEqual({ color: '#ff0000' })
  })

  it('converts font-size to camelCase fontSize', () => {
    expect(cssStringToReactStyle('font-size: 18px')).toEqual({ fontSize: '18px' })
  })

  it('converts multiple properties', () => {
    expect(cssStringToReactStyle('color: #fff; font-size: 1.5rem')).toEqual({
      color: '#fff',
      fontSize: '1.5rem',
    })
  })

  it('ignores trailing semicolons and blank segments', () => {
    expect(cssStringToReactStyle('color: red;')).toEqual({ color: 'red' })
  })

  it('handles hex color values (the actual use case)', () => {
    // $patchStyleText sets color as hex (#rrggbb), which never contains colons in the value
    expect(cssStringToReactStyle('color: #aabbcc')).toEqual({ color: '#aabbcc' })
  })

  it('returns empty object for null/undefined-like input', () => {
    expect(cssStringToReactStyle(undefined as unknown as string)).toEqual({})
  })
})
