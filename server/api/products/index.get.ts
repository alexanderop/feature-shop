import { getQuery } from 'h3'
import { z } from 'zod'
import { PRODUCTS } from '../../utils/catalog'

const querySchema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  category: z.string().trim().max(40).optional().catch(undefined),
})

export default defineEventHandler((event) => {
  const query = querySchema.parse(getQuery(event))
  const needle = query.q?.toLocaleLowerCase()

  return PRODUCTS.filter((product) => {
    const matchesCategory = !query.category || product.category === query.category
    const searchable = `${product.name} ${product.description} ${product.category}`.toLocaleLowerCase()
    return matchesCategory && (!needle || searchable.includes(needle))
  })
})
