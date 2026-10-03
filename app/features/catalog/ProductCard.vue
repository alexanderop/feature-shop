<script setup lang="ts">
import type { Product } from '#shared/shop'
import { formatMoney } from '#shared/shop'

defineProps<{ product: Product }>()
</script>

<template>
  <article class="product-card">
    <NuxtLink :to="`/products/${product.slug}`" tabindex="-1" aria-hidden="true">
      <ProductIllustration :color="product.color" :kind="product.category" />
    </NuxtLink>
    <div class="product-card-body">
      <p class="eyebrow">{{ product.category }}</p>
      <h2><NuxtLink :to="`/products/${product.slug}`">{{ product.name }}</NuxtLink></h2>
      <p class="product-copy">{{ product.description }}</p>
      <div class="product-card-actions">
        <strong>{{ formatMoney(product.priceMinor) }}</strong>
        <NuxtLink class="text-link" :to="`/products/${product.slug}`">View details</NuxtLink>
      </div>
    </div>
  </article>
</template>
