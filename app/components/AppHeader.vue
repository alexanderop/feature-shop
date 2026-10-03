<script setup lang="ts">
import type { Cart } from '#shared/shop'

const { data: cart } = await useFetch<Cart>('/api/cart', { key: 'cart', default: () => ({ lines: [], subtotalMinor: 0 }) })
const itemCount = computed(() => cart.value.lines.reduce((sum, line) => sum + line.quantity, 0))
</script>

<template>
  <header class="site-header">
    <NuxtLink class="brand" to="/" aria-label="Fieldwork home">
      <span class="brand-mark" aria-hidden="true">F</span>
      <span>Fieldwork</span>
    </NuxtLink>
    <nav aria-label="Main navigation">
      <NuxtLink to="/">Shop</NuxtLink>
      <NuxtLink to="/cart">
        Cart <span class="cart-count" aria-label="items in cart">{{ itemCount }}</span>
      </NuxtLink>
    </nav>
  </header>
</template>
