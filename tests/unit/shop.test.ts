import { describe, expect, it } from 'vitest'
import { buildCart, formatMoney, type Product } from '../../shared/shop'

const products: Product[] = [
  { id: 'bag', slug: 'bag', name: 'Bag', description: 'A bag', category: 'Carry', priceMinor: 4000, currency: 'EUR', color: '#000' },
]

describe('shop domain', () => {
  it('builds authoritative line totals from catalog prices', () => {
    expect(buildCart([{ productId: 'bag', quantity: 2 }], products)).toEqual({
      lines: [{ product: products[0], quantity: 2, lineTotalMinor: 8000 }],
      subtotalMinor: 8000,
    })
  })

  it('drops cart entries for products outside the catalog', () => {
    expect(buildCart([{ productId: 'forged', quantity: 2 }], products)).toEqual({ lines: [], subtotalMinor: 0 })
  })

  it('formats minor euro amounts for display', () => {
    expect(formatMoney(4000)).toMatch(/€40\.00|40\.00\s€/)
  })
})
