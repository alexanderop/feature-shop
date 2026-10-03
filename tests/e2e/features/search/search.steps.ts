import { Given, When, Then, expect } from '../../fixtures/test'

Given('I browse the catalog', async ({ searchPage }) => { await searchPage.open() })
When('I search for {string}', async ({ searchPage }, query: string) => { await searchPage.search(query) })
When('I select category {string}', async ({ searchPage }, category: string) => { await searchPage.category(category) })
Then('I see product {string}', async ({ searchPage }, name: string) => { await expect(searchPage.product(name)).toBeVisible() })
Then('I do not see product {string}', async ({ searchPage }, name: string) => { await expect(searchPage.product(name)).toHaveCount(0) })
Then('I see no matching products', async ({ page }) => { await expect(page.getByText('No products found', { exact: true })).toBeVisible() })
When('I open product {string}', async ({ searchPage }, name: string) => { await searchPage.product(name).click() })

When('I search using the keyboard for {string}', async ({ searchPage }, query: string) => { await searchPage.searchWithKeyboard(query) })
