import { createError, getRouterParam } from 'h3'
import { z } from 'zod'
import { findProductBySlug } from '../../utils/catalog'

const slugSchema = z.string().regex(/^[a-z0-9-]+$/).max(80)

export default defineEventHandler((event) => {
  const parsed = slugSchema.safeParse(getRouterParam(event, 'slug'))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid product slug' })
  const product = findProductBySlug(parsed.data)
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  return product
})
