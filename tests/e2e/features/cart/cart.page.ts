import type { Page } from '@playwright/test'

export class CartPage {
  constructor(readonly page: Page) {}
  async open() { await this.page.goto('/cart') }
  quantity(product: string) { return this.page.getByRole('combobox', { name: `Quantity for ${product}`, exact: true }) }
  async setQuantity(product: string, quantity: number) {
    await this.quantity(product).selectOption(String(quantity))
  }
  async remove(product: string) { await this.page.getByRole('button', { name: `Remove ${product}`, exact: true }).click() }
  get subtotal() { return this.page.getByTestId('cart-subtotal') }
}
