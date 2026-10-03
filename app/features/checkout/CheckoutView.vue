<script setup lang="ts">
import type { CheckoutResult } from '#shared/shop'
import { formatMoney } from '#shared/shop'
import { useCart } from '../cart/useCart'

const { cart } = useCart()
const form = reactive({ name: '', email: '', address: '', payment: 'approve' as 'approve' | 'decline' })
const errors = reactive({ name: '', email: '', address: '' })
const submitting = ref(false)
const result = ref<CheckoutResult | null>(null)
const requestError = ref('')

function validate(): boolean {
  errors.name = form.name.trim().length >= 2 ? '' : 'Enter your full name'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : 'Enter a valid email'
  errors.address = form.address.trim().length >= 8 ? '' : 'Enter your address'
  return !errors.name && !errors.email && !errors.address
}

async function placeOrder(): Promise<void> {
  if (submitting.value) return
  result.value = null
  requestError.value = ''
  if (!validate()) return
  submitting.value = true
  try {
    result.value = await $fetch<CheckoutResult>('/api/checkout', { method: 'POST', body: form })
    if (result.value.status === 'approved') await refreshNuxtData('cart')
  } catch {
    requestError.value = 'We could not place your order. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="page-section wrap">
    <template v-if="result?.status === 'approved'">
      <div class="confirmation-card">
        <p class="confirmation-mark" aria-hidden="true">✓</p>
        <p class="eyebrow">Receipt {{ result.receipt.orderId }}</p>
        <h1>Order confirmed</h1>
        <p>Thanks, {{ result.receipt.customerName }}. Your Fieldwork goods are being packed.</p>
        <p class="detail-price" data-testid="receipt-total">{{ formatMoney(result.receipt.totalMinor) }}</p>
        <UButton class="button" to="/">Return to the shop</UButton>
      </div>
    </template>
    <template v-else-if="cart.lines.length === 0">
      <div class="empty-state empty-card"><h1>Your cart is empty</h1><p>Add something useful before checking out.</p><NuxtLink class="button" to="/">Explore the collection</NuxtLink></div>
    </template>
    <template v-else>
      <p class="eyebrow">Delivery and payment</p>
      <h1>Checkout</h1>
      <div class="checkout-layout">
        <form class="checkout-form" novalidate @submit.prevent="placeOrder">
          <label for="full-name">Full name</label>
          <input id="full-name" v-model="form.name" autocomplete="name" :aria-invalid="Boolean(errors.name)" :aria-describedby="errors.name ? 'name-error' : undefined">
          <p v-if="errors.name" id="name-error" class="field-error">{{ errors.name }}</p>
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" autocomplete="email" :aria-invalid="Boolean(errors.email)" :aria-describedby="errors.email ? 'email-error' : undefined">
          <p v-if="errors.email" id="email-error" class="field-error">{{ errors.email }}</p>
          <label for="address">Address</label>
          <textarea id="address" v-model="form.address" autocomplete="street-address" rows="4" :aria-invalid="Boolean(errors.address)" :aria-describedby="errors.address ? 'address-error' : undefined" />
          <p v-if="errors.address" id="address-error" class="field-error">{{ errors.address }}</p>
          <label for="payment">Payment outcome</label>
          <select id="payment" v-model="form.payment">
            <option value="approve">Approved</option>
            <option value="decline">Declined</option>
          </select>
          <p class="simulation-notice">Checkout is a simulation. No payment is taken and no goods are shipped.</p>
          <p v-if="result?.status === 'declined'" class="notice notice-error" role="alert">{{ result.message }}</p>
          <p v-if="requestError" class="notice notice-error" role="alert">{{ requestError }}</p>
          <UButton class="button button-wide" type="submit" :disabled="submitting">Place order</UButton>
        </form>
        <aside class="order-summary" aria-labelledby="checkout-summary-title">
          <p class="eyebrow">Your order</p>
          <h2 id="checkout-summary-title">{{ cart.lines.length }} {{ cart.lines.length === 1 ? 'piece' : 'pieces' }}</h2>
          <div v-for="line in cart.lines" :key="line.product.id" class="checkout-line"><span>{{ line.quantity }} × {{ line.product.name }}</span><strong>{{ formatMoney(line.lineTotalMinor) }}</strong></div>
          <div class="summary-total"><span>Subtotal</span><strong data-testid="checkout-subtotal">{{ formatMoney(cart.subtotalMinor) }}</strong></div>
        </aside>
      </div>
    </template>
  </section>
</template>
