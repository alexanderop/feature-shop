import type { Page } from '@playwright/test'

export class ProductDetailPage {
  constructor(readonly page: Page) {}
  async open(slug: string) { await this.page.goto(`/products/${slug}`) }
  async addToCart() { await this.page.getByRole('button', { name: 'Add to cart', exact: true }).click() }
}
