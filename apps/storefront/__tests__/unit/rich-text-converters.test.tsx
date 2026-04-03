import { cssStringToReactStyle } from '@/lib/cms/rich-text-converters'

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
