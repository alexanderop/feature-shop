<script setup lang="ts">
import { formatMoney } from '#shared/shop'
import { useCart } from './useCart'

const { cart, setQuantity } = useCart()
const updating = ref<string | null>(null)

async function update(productId: string, quantity: number): Promise<void> {
  if (updating.value !== null) return
  updating.value = productId
  try {
    await setQuantity(productId, quantity)
  } finally {
    updating.value = null
  }
}
</script>

<template>
  <section class="page-section wrap">
    <p class="eyebrow">Your field kit</p>
    <h1>Cart</h1>
    <div v-if="cart.lines.length === 0" class="empty-state empty-card">
      <h2>Your cart is empty</h2>
      <p>Start with one good thing, then see where it takes you.</p>
      <NuxtLink class="button" to="/">Explore the collection</NuxtLink>
    </div>
    <div v-else class="cart-layout">
      <ul class="cart-lines" aria-label="Cart items">
        <li v-for="line in cart.lines" :key="line.product.id" class="cart-line">
          <ProductIllustration :color="line.product.color" :kind="line.product.category" />
          <div class="cart-line-copy">
            <p class="eyebrow">{{ line.product.category }}</p>
            <h2><NuxtLink :to="`/products/${line.product.slug}`">{{ line.product.name }}</NuxtLink></h2>
            <p>{{ formatMoney(line.product.priceMinor) }} each</p>
            <label :for="`cart-quantity-${line.product.id}`">Quantity for {{ line.product.name }}</label>
            <select :id="`cart-quantity-${line.product.id}`" :value="line.quantity" :disabled="updating !== null" @change="update(line.product.id, Number(($event.target as HTMLSelectElement).value))">
              <option v-for="number in 10" :key="number" :value="number">{{ number }}</option>
            </select>
            <button class="text-button" type="button" :disabled="updating !== null" @click="update(line.product.id, 0)">Remove {{ line.product.name }}</button>
          </div>
          <strong>{{ formatMoney(line.lineTotalMinor) }}</strong>
        </li>
      </ul>
      <aside class="order-summary" aria-labelledby="summary-title">
        <p class="eyebrow">Order summary</p>
        <h2 id="summary-title">Ready to head out?</h2>
        <div class="summary-total"><span>Subtotal</span><strong data-testid="cart-subtotal">{{ formatMoney(cart.subtotalMinor) }}</strong></div>
        <p>Tax included. Shipping is on us for this field test.</p>
        <UButton class="button button-wide" to="/checkout">Checkout</UButton>
      </aside>
    </div>
  </section>
</template>
