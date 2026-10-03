import { Given, When, Then, expect } from '../../fixtures/test'
import { aBackpack } from '../../fixtures/data'

Given('my cart contains {int} backpacks', async ({ context }, quantity: number) => {
  const response = await context.request.put('/api/cart', { data: { productId: aBackpack().id, quantity } })
  expect(response.ok()).toBe(true)
  expect(await response.json()).toEqual({
    lines: [{ product: expect.objectContaining({ id: aBackpack().id }), quantity, lineTotalMinor: 4000 * quantity }],
    subtotalMinor: 4000 * quantity,
  })
})
When('I open my cart', async ({ cartPage }) => { await cartPage.open() })
When('I set my backpack quantity to {int}', async ({ cartPage }, quantity: number) => { await cartPage.setQuantity(aBackpack().name, quantity) })
When('I reload the page', async ({ page }) => { await page.reload() })
When('I remove the backpack', async ({ cartPage }) => { await cartPage.remove(aBackpack().name) })
Then('my backpack quantity is {int}', async ({ cartPage }, quantity: number) => { await expect(cartPage.quantity(aBackpack().name)).toHaveValue(String(quantity)) })
Then('my cart subtotal is {string}', async ({ cartPage }, amount: string) => { await expect(cartPage.subtotal).toHaveText(`€${amount}`) })
Then('my cart is empty', async ({ page }) => { await expect(page.getByText('Your cart is empty', { exact: true })).toBeVisible() })
Then('a separate shopper has an empty cart', async ({ browser, baseURL }) => {
  const otherContext = await browser.newContext({ baseURL })
  try {
    const otherPage = await otherContext.newPage()
    await otherPage.goto('/cart')
    await expect(otherPage.getByText('Your cart is empty', { exact: true })).toBeVisible()
  } finally {
    await otherContext.close()
  }
})
