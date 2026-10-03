<script setup lang="ts">
import type { Cart, Product } from '#shared/shop'
import { formatMoney } from '#shared/shop'

const props = defineProps<Readonly<{ slug: string }>>()
const { data: product } = await useFetch<Product>(`/api/products/${props.slug}`)
const quantity = ref(1)
const adding = ref(false)
const message = ref('')

async function addToCart(): Promise<void> {
  if (!product.value) return
  adding.value = true
  message.value = ''
  try {
    const cart = await $fetch<Cart>('/api/cart')
    const current = cart.lines.find(line => line.product.id === product.value?.id)?.quantity ?? 0
    await $fetch('/api/cart', {
      method: 'PUT',
      body: { productId: product.value.id, quantity: Math.min(current + quantity.value, 10) },
    })
    await refreshNuxtData('cart')
    message.value = `Added ${product.value.name} to cart.`
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <div v-if="product" class="detail wrap">
    <NuxtLink class="back-link" to="/">← Back to the collection</NuxtLink>
    <div class="detail-grid">
      <ProductIllustration :color="product.color" :kind="product.category" />
      <section class="detail-copy">
        <p class="eyebrow">{{ product.category }}</p>
        <h1>{{ product.name }}</h1>
        <p class="detail-price">{{ formatMoney(product.priceMinor) }}</p>
        <p>{{ product.description }}</p>
        <p class="material-note">Designed in Berlin. Built in small batches for daily use.</p>
        <form class="add-form" @submit.prevent="addToCart">
          <label :for="`quantity-${product.id}`">Quantity for {{ product.name }}</label>
          <input :id="`quantity-${product.id}`" v-model.number="quantity" type="number" min="1" max="10" required>
          <UButton class="button" type="submit" :disabled="adding">Add to cart</UButton>
        </form>
        <p class="status-line" role="status">{{ message }}</p>
      </section>
    </div>
  </div>
</template>
