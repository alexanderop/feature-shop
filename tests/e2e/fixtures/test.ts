import { test as base, createBdd } from 'playwright-bdd'
import { SearchPage } from '../features/search/search.page'
import { ProductDetailPage } from '../features/product-detail/product-detail.page'
import { CartPage } from '../features/cart/cart.page'
import { CheckoutPage } from '../features/checkout/checkout.page'

type ShopFixtures = {
  searchPage: SearchPage
  productPage: ProductDetailPage
  cartPage: CartPage
  checkoutPage: CheckoutPage
}

export const test = base.extend<ShopFixtures>({
  searchPage: async ({ page }, use) => { await use(new SearchPage(page)) },
  productPage: async ({ page }, use) => { await use(new ProductDetailPage(page)) },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)) },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)) },
})

export const { Given, When, Then } = createBdd(test)
export { expect } from '@playwright/test'
