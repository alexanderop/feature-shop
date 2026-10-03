import type { H3Event } from 'h3'
import { deleteCookie, getCookie, setCookie } from 'h3'
import { z } from 'zod'
import { buildCart, type Cart, type StoredCartItem } from '#shared/shop'
import { PRODUCTS } from './catalog'

const CART_COOKIE = 'fieldwork_cart'
const cartItemSchema = z.object({
  productId: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(10),
})
const storedCartSchema = z.array(cartItemSchema).max(20).superRefine((items, context) => {
  const productIds = new Set<string>()
  for (const [index, item] of items.entries()) {
    if (productIds.has(item.productId)) {
      context.addIssue({ code: 'custom', message: 'Duplicate product', path: [index, 'productId'] })
    }
    productIds.add(item.productId)
  }
})

export function readStoredCart(event: H3Event): StoredCartItem[] {
  const value = getCookie(event, CART_COOKIE)
  if (!value) return []

  try {
    const parsed: unknown = JSON.parse(value)
    return storedCartSchema.parse(parsed)
  } catch {
    deleteCookie(event, CART_COOKIE, { path: '/' })
    return []
  }
}

export function readCart(event: H3Event): Cart {
  return buildCart(readStoredCart(event), PRODUCTS)
}

export function writeCart(event: H3Event, items: readonly StoredCartItem[]): void {
  const parsed = storedCartSchema.parse(items)
  if (parsed.length === 0) {
    deleteCookie(event, CART_COOKIE, { path: '/' })
    return
  }

  setCookie(event, CART_COOKIE, JSON.stringify(parsed), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}
