import type { Page } from '@playwright/test'
import { aCustomer } from '../../fixtures/data'

export class CheckoutPage {
  constructor(readonly page: Page) {}
  async open() { await this.page.goto('/checkout') }
  async fillCustomer() {
    const customer = aCustomer()
    await this.page.getByLabel('Full name', { exact: true }).fill(customer.name)
    await this.page.getByLabel('Email', { exact: true }).fill(customer.email)
    await this.page.getByLabel('Address', { exact: true }).fill(customer.address)
  }
  async payment(outcome: 'Approved' | 'Declined') { await this.page.getByLabel('Payment outcome', { exact: true }).selectOption(outcome === 'Approved' ? 'approve' : 'decline') }
  async placeOrder() { await this.page.getByRole('button', { name: 'Place order', exact: true }).click() }
}
