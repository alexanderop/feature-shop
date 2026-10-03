<script setup lang="ts">
defineProps<{ color: string; kind: string }>()
</script>

<template>
  <div class="product-art" :style="{ '--product-color': color }" aria-hidden="true">
    <svg v-if="kind === 'Carry'" viewBox="0 0 240 220" role="presentation">
      <path d="M82 61c0-24 13-38 38-38s38 14 38 38" fill="none" stroke="currentColor" stroke-width="10" />
      <path d="M59 67h122l18 126H41L59 67Z" fill="var(--product-color)" stroke="currentColor" stroke-width="7" />
      <path d="M77 115h86v59H77z" fill="#f3e9d2" stroke="currentColor" stroke-width="6" />
    </svg>
    <svg v-else-if="kind === 'Drinkware'" viewBox="0 0 240 220" role="presentation">
      <path d="M91 34h58v24H91z" fill="#e8dcc4" stroke="currentColor" stroke-width="7" />
      <path d="M82 58h76l-8 133H90L82 58Z" fill="var(--product-color)" stroke="currentColor" stroke-width="7" />
      <path d="M91 93h58" fill="none" stroke="#f3e9d2" stroke-width="6" />
    </svg>
    <svg v-else-if="kind === 'Wear'" viewBox="0 0 240 220" role="presentation">
      <path d="M57 119c4-52 30-81 74-81 34 0 57 25 62 75" fill="var(--product-color)" stroke="currentColor" stroke-width="7" />
      <path d="M57 118c41-11 93-11 156 10-13 22-43 31-90 25-35-4-57-16-66-35Z" fill="#f3e9d2" stroke="currentColor" stroke-width="7" />
    </svg>
    <svg v-else viewBox="0 0 240 220" role="presentation">
      <path d="M43 54h154v122H43z" fill="var(--product-color)" stroke="currentColor" stroke-width="7" />
      <path d="m43 54 154 122M197 54 43 176" stroke="#f3e9d2" stroke-width="5" />
      <path d="M43 176h154v19H43z" fill="#e8dcc4" stroke="currentColor" stroke-width="7" />
    </svg>
  </div>
</template>
