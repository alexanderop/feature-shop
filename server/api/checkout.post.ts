import { createError, readBody } from 'h3'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import type { CheckoutResult } from '#shared/shop'
import { readCart, writeCart } from '../utils/cart'

const checkoutSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  address: z.string().trim().min(8).max(300),
  payment: z.enum(['approve', 'decline']),
})

export default defineEventHandler(async (event): Promise<CheckoutResult> => {
  const parsed = checkoutSchema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Check your order details' })
  const cart = readCart(event)
  if (cart.lines.length === 0) throw createError({ statusCode: 400, statusMessage: 'Your cart is empty' })

  if (parsed.data.payment === 'decline') {
    return { status: 'declined', message: 'Payment declined. Your cart is safe. Try again.' }
  }

  writeCart(event, [])
  return {
    status: 'approved',
    receipt: {
      orderId: `FW-${randomUUID().slice(0, 8).toUpperCase()}`,
      totalMinor: cart.subtotalMinor,
      currency: 'EUR',
      customerName: parsed.data.name,
    },
  }
})
