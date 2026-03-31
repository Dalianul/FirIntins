jest.mock('@/lib/medusa/client', () => ({
  medusa: {
    store: {
      product: {
        list: jest.fn().mockResolvedValue({
          products: [],
          count: 0,
          limit: 12,
          offset: 0,
        }),
      },
    },
  },
}))

import { medusa } from '@/lib/medusa/client'
import { getProducts, SORT_ORDER_MAP } from '@/lib/medusa/queries'

const mockList = medusa.store.product.list as jest.Mock

describe('SORT_ORDER_MAP', () => {
  it('maps newest to created_at DESC', () => {
    expect(SORT_ORDER_MAP['newest']).toEqual({ created_at: 'DESC' })
  })
  it('maps title_asc to title ASC', () => {
    expect(SORT_ORDER_MAP['title_asc']).toEqual({ title: 'ASC' })
  })
  it('maps title_desc to title DESC', () => {
    expect(SORT_ORDER_MAP['title_desc']).toEqual({ title: 'DESC' })
  })
  it('does not include price_asc — handled post-fetch', () => {
    expect(SORT_ORDER_MAP['price_asc']).toBeUndefined()
  })
  it('does not include relevance — Medusa default order', () => {
    expect(SORT_ORDER_MAP['relevance']).toBeUndefined()
  })
})

describe('getProducts', () => {
  beforeEach(() => mockList.mockClear())

  it('passes q to the SDK', async () => {
    await getProducts({ q: 'undite' })
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'undite' })
    )
  })

  it('passes order to the SDK', async () => {
    await getProducts({ order: { created_at: 'DESC' } })
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({ order: { created_at: 'DESC' } })
    )
  })

  it('requests inventory_quantity field expansion', async () => {
    await getProducts({})
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({ fields: expect.stringContaining('inventory_quantity') })
    )
  })
})
