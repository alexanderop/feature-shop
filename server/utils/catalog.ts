import type { Product } from '#shared/shop'

export const PRODUCTS: readonly Product[] = Object.freeze([
  {
    id: 'prod_backpack',
    slug: 'canvas-backpack',
    name: 'Canvas Backpack',
    description: 'A sturdy everyday pack with a generous main compartment and weather-ready waxed canvas.',
    category: 'Carry',
    priceMinor: 4000,
    currency: 'EUR',
    color: '#cf6539',
  },
  {
    id: 'prod_bottle',
    slug: 'everyday-bottle',
    name: 'Everyday Bottle',
    description: 'Double-wall steel keeps trail water cold and desk coffee warm without leaving a ring.',
    category: 'Drinkware',
    priceMinor: 2400,
    currency: 'EUR',
    color: '#396255',
  },
  {
    id: 'prod_cap',
    slug: 'trail-cap',
    name: 'Trail Cap',
    description: 'A light, quick-drying cap cut for long afternoons outside and easy weekends in town.',
    category: 'Wear',
    priceMinor: 1800,
    currency: 'EUR',
    color: '#d89534',
  },
  {
    id: 'prod_blanket',
    slug: 'camp-blanket',
    name: 'Camp Blanket',
    description: 'A soft recycled-wool layer for late fires, cool cabins, and the back seat of the car.',
    category: 'Camp',
    priceMinor: 6800,
    currency: 'EUR',
    color: '#793f32',
  },
])

export function findProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(product => product.slug === slug)
}
