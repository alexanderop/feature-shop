import { createError, readBody } from 'h3'
import { z } from 'zod'
import { buildCart } from '#shared/shop'
import { PRODUCTS } from '../../utils/catalog'
import { readStoredCart, writeCart } from '../../utils/cart'

const updateSchema = z.object({
  productId: z.string().min(1).max(64),
  quantity: z.number().int().min(0).max(10),
})

export default defineEventHandler(async (event) => {
  const parsed = updateSchema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid cart update' })
  if (!PRODUCTS.some(product => product.id === parsed.data.productId)) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const current = readStoredCart(event).filter(item => item.productId !== parsed.data.productId)
  if (parsed.data.quantity > 0) current.push(parsed.data)
  if (current.length > 20) throw createError({ statusCode: 400, statusMessage: 'Cart is full' })
  writeCart(event, current)
  return buildCart(current, PRODUCTS)
})
