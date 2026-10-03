import type { Page } from '@playwright/test'

export class SearchPage {
  constructor(readonly page: Page) {}
  async open() { await this.page.goto('/') }
  async search(query: string) {
    await this.page.getByRole('searchbox', { name: 'Search products' }).fill(query)
    await this.page.getByRole('button', { name: 'Search', exact: true }).click()
  }
  async searchWithKeyboard(query: string) {
    const searchbox = this.page.getByRole('searchbox', { name: 'Search products' })
    await searchbox.focus()
    await searchbox.fill(query)
    await searchbox.press('Enter')
  }
  async category(name: string) { await this.page.getByLabel('Category', { exact: true }).selectOption({ label: name }) }
  product(name: string) { return this.page.getByRole('link', { name, exact: true }) }
}
