import { When, Then, expect } from '../../fixtures/test'

When('I open checkout', async ({ checkoutPage }) => { await checkoutPage.open() })
When('I enter valid customer details', async ({ checkoutPage }) => { await checkoutPage.fillCustomer() })
When('I choose an approved payment', async ({ checkoutPage }) => { await checkoutPage.payment('Approved') })
When('I choose a declined payment', async ({ checkoutPage }) => { await checkoutPage.payment('Declined') })
When('I place my order', async ({ checkoutPage }) => { await checkoutPage.placeOrder() })
Then('I see required customer field errors', async ({ page }) => {
  await expect(page.getByText('Enter your full name', { exact: true })).toBeVisible()
  await expect(page.getByText('Enter a valid email', { exact: true })).toBeVisible()
  await expect(page.getByText('Enter your address', { exact: true })).toBeVisible()
})
Then('my payment is declined without losing my cart', async ({ page }) => {
  await expect(page.getByRole('alert')).toContainText('Payment declined. Your cart is safe. Try again.')
  await expect(page.getByTestId('checkout-subtotal')).toHaveText('€40.00')
})
Then('my order is confirmed', async ({ page }) => { await expect(page.getByRole('heading', { name: 'Order confirmed', exact: true })).toBeVisible() })

Then('my receipt total is {string}', async ({ page }, amount: string) => { await expect(page.getByTestId('receipt-total')).toHaveText(`€${amount}`) })
