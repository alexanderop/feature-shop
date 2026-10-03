import { Given, When, Then, expect } from '../../fixtures/test'
import { aBackpack } from '../../fixtures/data'

Given('I view the Canvas Backpack', async ({ productPage }) => { await productPage.open(aBackpack().slug) })
Then('I see the Canvas Backpack details', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Canvas Backpack', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add to cart', exact: true })).toBeVisible()
})
When('I add the product to my cart', async ({ productPage, page }) => {
  await productPage.addToCart()
  await expect(page.getByText('Added Canvas Backpack to cart.', { exact: true })).toBeVisible()
})
