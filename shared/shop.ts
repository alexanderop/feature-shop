export type Currency = 'EUR'

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  category: string
  priceMinor: number
  currency: Currency
  color: string
}

export interface StoredCartItem {
  productId: string
  quantity: number
}

export interface CartLine {
  product: Product
  quantity: number
  lineTotalMinor: number
}

export interface Cart {
  lines: CartLine[]
  subtotalMinor: number
}

export interface CheckoutReceipt {
  orderId: string
  totalMinor: number
  currency: Currency
  customerName: string
}

export type CheckoutResult =
  | { status: 'approved'; receipt: CheckoutReceipt }
  | { status: 'declined'; message: string }

export const EMPTY_CART: Cart = { lines: [], subtotalMinor: 0 }

export function buildCart(items: readonly StoredCartItem[], products: readonly Product[]): Cart {
  const productsById = new Map(products.map(product => [product.id, product]))
  const lines = items.flatMap((item): CartLine[] => {
    const product = productsById.get(item.productId)
    if (!product || item.quantity < 1) return []
    return [{ product, quantity: item.quantity, lineTotalMinor: product.priceMinor * item.quantity }]
  })

  return {
    lines,
    subtotalMinor: lines.reduce((sum, line) => sum + line.lineTotalMinor, 0),
  }
}

export function formatMoney(valueMinor: number, currency: Currency = 'EUR'): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(valueMinor / 100)
}
