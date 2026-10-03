import { describe, expect, it } from 'vitest'
import { selectAffected, consumers, type Scenario } from '../../tools/impact'
import { parseNameStatus } from '../../tools/git'

const scenarios: Scenario[] = [
  { id: 'search', name: 'Search', file: 'tests/e2e/features/search/search.feature', line: 1, features: ['search'] },
  { id: 'detail', name: 'Detail', file: 'tests/e2e/features/product-detail/detail.feature', line: 1, features: ['product-detail'] },
  { id: 'cart', name: 'Cart', file: 'tests/e2e/features/cart/cart.feature', line: 1, features: ['cart'] },
  { id: 'checkout', name: 'Checkout', file: 'tests/e2e/features/checkout/checkout.feature', line: 1, features: ['checkout'] },
  { id: 'purchase', name: 'Purchase', file: 'tests/e2e/journeys/purchase.feature', line: 1, features: ['search', 'product-detail', 'cart', 'checkout'] },
]
const selected = (paths: string[]) => selectAffected(paths, scenarios).scenarios.map(scenario => scenario.id)

describe('affected scenario selection', () => {
  it('selects search and the purchase journey without isolated checkout', () => {
    expect(selected(['app/features/search/SearchForm.vue'])).toEqual(['search', 'purchase'])
  })
  it('follows cart consumers through checkout', () => {
    expect(selected(['app/features/cart/totals.ts'])).toEqual(['detail', 'cart', 'checkout', 'purchase'])
  })
  it('selects every catalog consumer', () => {
    expect(consumers(['catalog'])).toEqual(['catalog', 'search', 'product-detail', 'cart', 'checkout'])
    expect(selected(['server/api/products/index.get.ts'])).toEqual(['search', 'detail', 'cart', 'checkout', 'purchase'])
  })
  it.each(['pnpm-lock.yaml', 'nuxt.config.ts', 'tools/impact.ts', 'tests/e2e/fixtures/test.ts', 'app/components/Button.vue', 'surprise.ts'])(
    'runs everything for global or unknown file %s', path => {
      expect(selectAffected([path], scenarios).mode).toBe('all')
      expect(selected([path])).toHaveLength(5)
    },
  )
  it('runs a changed cross-feature scenario directly', () => {
    expect(selected(['tests/e2e/journeys/purchase.feature'])).toEqual(['purchase'])
  })
  it('skips only explicitly recognized non-runtime documentation', () => {
    expect(selected(['README.md', 'docs/cli.md'])).toEqual([])
    expect(selected(['app/features/search/help.md'])).toEqual(['search', 'purchase'])
  })
  it('falls back to all when Git comparison fails', () => {
    expect(selectAffected([], scenarios, 'missing base').scenarios).toHaveLength(5)
  })
  it('includes changed specs even without application changes', () => {
    expect(selected(['tests/e2e/features/cart/cart.feature'])).toEqual(['detail', 'cart', 'checkout', 'purchase'])
  })
  it('handles an empty diff explicitly', () => {
    expect(selected([])).toEqual([])
  })
})

describe('Git change records', () => {
  it('includes old and new rename paths plus deletions and whitespace', () => {
    expect(parseNameStatus('R100\0app/features/search/a.vue\0app/features/cart/a.vue\0D\0file with spaces.ts\0')).toEqual([
      'app/features/search/a.vue', 'app/features/cart/a.vue', 'file with spaces.ts',
    ])
  })
  it('refuses an incomplete record', () => {
    expect(() => parseNameStatus('R100\0old.ts\0')).toThrow('Incomplete')
  })
})
