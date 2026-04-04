import { isAdmin, isAdminOrEditor, isAdminField } from '@/lib/cms/access'

function makeReq(role?: string) {
  return { user: role ? { role } : null } as any
}

describe('isAdmin', () => {
  it('returns true when role is admin', () => {
    expect(isAdmin({ req: makeReq('admin') })).toBe(true)
  })
  it('returns false when role is editor', () => {
    expect(isAdmin({ req: makeReq('editor') })).toBe(false)
  })
  it('returns false when no user', () => {
    expect(isAdmin({ req: makeReq() })).toBe(false)
  })
})

describe('isAdminOrEditor', () => {
  it('returns true for admin', () => {
    expect(isAdminOrEditor({ req: makeReq('admin') })).toBe(true)
  })
  it('returns true for editor', () => {
    expect(isAdminOrEditor({ req: makeReq('editor') })).toBe(true)
  })
  it('returns false with no user', () => {
    expect(isAdminOrEditor({ req: makeReq() })).toBe(false)
  })
})

describe('isAdminField', () => {
  it('returns true for admin', () => {
    expect(isAdminField({ req: makeReq('admin') } as any)).toBe(true)
  })
  it('returns false for editor', () => {
    expect(isAdminField({ req: makeReq('editor') } as any)).toBe(false)
  })
})
