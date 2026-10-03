export const featureIds = ['catalog', 'search', 'product-detail', 'cart', 'checkout'] as const
export type FeatureId = typeof featureIds[number]

export const features: Record<FeatureId, { paths: readonly string[]; dependsOn: readonly FeatureId[] }> = {
  catalog: { paths: ['server/domain/catalog.ts', 'server/api/products/', 'server/api/products.get.ts', 'shared/catalog', 'server/utils/catalog.ts', 'app/features/catalog/'], dependsOn: [] },
  search: { paths: ['app/features/search/', 'app/pages/index.vue', 'tests/e2e/features/search/'], dependsOn: ['catalog'] },
  'product-detail': { paths: ['app/features/product-detail/', 'app/pages/products/', 'tests/e2e/features/product-detail/'], dependsOn: ['catalog', 'cart'] },
  cart: { paths: ['app/features/cart/', 'app/pages/cart.vue', 'server/api/cart', 'server/domain/cart', 'server/utils/cart.ts', 'tests/e2e/features/cart/'], dependsOn: ['catalog'] },
  checkout: { paths: ['app/features/checkout/', 'app/pages/checkout.vue', 'server/api/checkout', 'server/domain/checkout', 'tests/e2e/features/checkout/'], dependsOn: ['cart', 'catalog'] },
}

export interface Scenario {
  id: string
  name: string
  file: string
  line: number
  features: FeatureId[]
}
export interface Selection {
  schemaVersion: 1
  mode: 'all' | 'affected' | 'scenario'
  changedFiles: string[]
  features: FeatureId[]
  scenarios: Scenario[]
  reasons: { path: string; reason: string; features: FeatureId[] }[]
}

export function consumers(initial: Iterable<FeatureId>): FeatureId[] {
  const result = new Set(initial)
  let changed = true
  while (changed) {
    changed = false
    for (const id of featureIds) {
      if (!result.has(id) && features[id].dependsOn.some(dependency => result.has(dependency))) {
        result.add(id)
        changed = true
      }
    }
  }
  return featureIds.filter(id => result.has(id))
}

export function owners(path: string): FeatureId[] {
  return featureIds.filter(id => features[id].paths.some(prefix => {
    if (path === prefix) return true
    if (prefix.endsWith('/')) return path.startsWith(prefix)
    if (/\.[a-z]+$/i.test(prefix)) return false
    return path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}.`)
  }))
}

export function selectAffected(paths: string[], scenarios: Scenario[], fallback?: string): Selection {
  const reasons: Selection['reasons'] = []
  const selected = new Set<FeatureId>()
  const direct = new Set<string>()
  let all = Boolean(fallback)
  if (fallback) reasons.push({ path: '*', reason: fallback, features: [...featureIds] })
  for (const path of [...new Set(paths)].sort()) {
    if (path === 'README.md' || path === 'AGENTS.md' || path.startsWith('docs/')) {
      reasons.push({ path, reason: 'Documentation only', features: [] })
      continue
    }
    const matches = owners(path)
    const fileScenarios = scenarios.filter(scenario => scenario.file === path)
    if (matches.length > 1) {
      all = true
      reasons.push({ path, reason: 'Ambiguous ownership; run all', features: [...featureIds] })
    } else if (matches.length === 1) {
      const affected = consumers(matches)
      affected.forEach(id => selected.add(id))
      reasons.push({ path, reason: `Owner ${matches[0]} and dependent features`, features: affected })
    } else if (fileScenarios.length) {
      fileScenarios.forEach(scenario => direct.add(scenario.id))
      reasons.push({ path, reason: 'Changed journey scenario', features: [] })
    } else {
      all = true
      reasons.push({ path, reason: 'Global or unowned file; run all', features: [...featureIds] })
    }
  }
  return {
    schemaVersion: 1,
    mode: all ? 'all' : 'affected',
    changedFiles: [...new Set(paths)].sort(),
    features: all ? [...featureIds] : featureIds.filter(id => selected.has(id)),
    scenarios: all ? scenarios : scenarios.filter(scenario => direct.has(scenario.id) || scenario.features.some(id => selected.has(id))),
    reasons,
  }
}
