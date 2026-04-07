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
      region: {
        list: jest.fn().mockResolvedValue({
          regions: [{ id: 'reg_test' }],
        }),
      },
    },
  },
}))

import { medusa } from '@/lib/medusa/client'
import { getProducts, SORT_ORDER_MAP, getOfferProducts } from '@/lib/medusa/queries'

const mockList = medusa.store.product.list as jest.Mock

describe('SORT_ORDER_MAP', () => {
  it('maps newest to -created_at (DESC string)', () => {
    expect(SORT_ORDER_MAP['newest']).toBe('-created_at')
  })
  it('maps title_asc to title (ASC string)', () => {
    expect(SORT_ORDER_MAP['title_asc']).toBe('title')
  })
  it('maps title_desc to -title (DESC string)', () => {
    expect(SORT_ORDER_MAP['title_desc']).toBe('-title')
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

  it('requests calculated_price and inventory_quantity field expansion', async () => {
    await getProducts({})
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.stringContaining('calculated_price'),
      })
    )
  })
})

describe('getOfferProducts', () => {
  beforeEach(() => mockList.mockClear())

  it('returns products with is_oferta: true', async () => {
    mockList.mockResolvedValue({
      products: [
        { id: '1', metadata: { is_oferta: true } },
        { id: '2', metadata: { is_oferta: false } },
        { id: '3', metadata: {} },
        { id: '4', metadata: { is_oferta: true } },
      ],
    })
    const result = await getOfferProducts()
    expect(result).toHaveLength(2)
    expect(result.map((p: any) => p.id)).toEqual(['1', '4'])
  })

  it('returns products with discount_percentage > 0', async () => {
    mockList.mockResolvedValue({
      products: [
        { id: '1', metadata: { discount_percentage: 20 } },
        { id: '2', metadata: { discount_percentage: 0 } },
        { id: '3', metadata: {} },
      ],
    })
    const result = await getOfferProducts()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('returns products matching either is_oferta or discount_percentage', async () => {
    mockList.mockResolvedValue({
      products: [
        { id: '1', metadata: { is_oferta: true } },
        { id: '2', metadata: { discount_percentage: 15 } },
        { id: '3', metadata: { is_oferta: false, discount_percentage: 0 } },
        { id: '4', metadata: {} },
      ],
    })
    const result = await getOfferProducts()
    expect(result).toHaveLength(2)
    expect(result.map((p: any) => p.id)).toEqual(['1', '2'])
  })

  it('returns empty array when no products qualify', async () => {
    mockList.mockResolvedValue({
      products: [
        { id: '1', metadata: {} },
        { id: '2', metadata: { is_oferta: false } },
        { id: '3', metadata: { discount_percentage: 0 } },
      ],
    })
    const result = await getOfferProducts()
    expect(result).toHaveLength(0)
  })

  it('calls product.list with limit 100, region_id, and calculated_price fields', async () => {
    mockList.mockResolvedValue({ products: [] })
    await getOfferProducts()
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 100,
        region_id: 'reg_test',
        fields: '*variants.calculated_price,+variants.inventory_quantity,+metadata',
      })
    )
  })
})
