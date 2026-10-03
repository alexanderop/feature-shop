<script setup lang="ts">
import ProductDetailView from '../../features/product-detail/ProductDetailView.vue'

const route = useRoute()
const slug = String(route.params.slug)
</script>

<template><ProductDetailView :slug="slug" /></template>
