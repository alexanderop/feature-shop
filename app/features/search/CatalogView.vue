<script setup lang="ts">
import type { Product } from '#shared/shop'
import ProductCard from '../catalog/ProductCard.vue'

const route = useRoute()
const search = ref(typeof route.query.q === 'string' ? route.query.q : '')
const category = ref(typeof route.query.category === 'string' ? route.query.category : '')
const requestQuery = computed(() => ({ q: route.query.q || undefined, category: route.query.category || undefined }))
const { data: products, status } = await useFetch<Product[]>('/api/products', { query: requestQuery, default: () => [] })
const categories = ['Carry', 'Drinkware', 'Wear', 'Camp']

async function applyFilters(): Promise<void> {
  await navigateTo({ path: '/', query: { q: search.value || undefined, category: category.value || undefined } })
}
</script>

<template>
  <div>
    <section class="hero wrap">
      <p class="eyebrow">Field notes · Edition 01</p>
      <h1>Made for the everyday outside.</h1>
      <p>Everyday outdoor essentials with honest materials and useful details.</p>
    </section>
    <section class="catalog wrap" aria-labelledby="catalog-title">
      <div class="section-heading">
        <div><p class="eyebrow">The collection</p><h2 id="catalog-title">Pack well. Wander often.</h2></div>
        <form class="filters" role="search" @submit.prevent="applyFilters">
          <label>Search products<input v-model="search" name="q" type="search" placeholder="Bottle, cap, canvas…"></label>
          <div class="field-control"><label for="category-filter">Category</label><select id="category-filter" v-model="category" name="category" @change="applyFilters"><option value="">All categories</option><option v-for="item in categories" :key="item" :value="item">{{ item }}</option></select></div>
          <UButton class="button button-small" type="submit">Search</UButton>
        </form>
      </div>
      <p v-if="status === 'pending'" class="empty-state">Loading the collection…</p>
      <p v-else-if="products.length === 0" class="empty-state">No products found</p>
      <div v-else class="product-grid">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
    </section>
  </div>
</template>
