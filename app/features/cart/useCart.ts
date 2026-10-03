import type { Cart } from '#shared/shop'

export function useCart() {
  const { data: cart, status } = useFetch<Cart>('/api/cart', {
    key: 'cart',
    default: () => ({ lines: [], subtotalMinor: 0 }),
  })

  async function setQuantity(productId: string, quantity: number): Promise<void> {
    await $fetch<Cart>('/api/cart', { method: 'PUT', body: { productId, quantity } })
    await refreshNuxtData('cart')
  }

  return { cart, status, setQuantity }
}
