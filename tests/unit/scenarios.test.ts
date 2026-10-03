import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { expect, it } from 'vitest'
import { readScenarios } from '../../tools/scenarios'

function read(source: string) {
  const cwd = mkdtempSync(join(tmpdir(), 'fieldwork-gherkin-'))
  try {
    mkdirSync(join(cwd, 'tests/e2e'), { recursive: true })
    writeFileSync(join(cwd, 'tests/e2e/test.feature'), source)
    return readScenarios(cwd)
  } finally { rmSync(cwd, { recursive: true, force: true }) }
}

it('inherits coverage from features and rules', () => {
  const scenarios = read('@cart\nFeature: Cart\n  @checkout\n  Rule: Purchase\n    @id:purchase\n    Scenario: Buy\n      Given a cart\n      Then an order\n')
  expect(scenarios[0]?.features).toEqual(['cart', 'checkout'])
  expect(scenarios[0]?.id).toBe('purchase')
})
it.each(['@fail', '@skip', '@fixme', '@only'])('rejects %s even on an Examples table', tag => {
  expect(() => read(`@cart\nFeature: Cart\n  @id:quantity\n  Scenario Outline: Quantities\n    Then the total is <amount>\n    ${tag}\n    Examples:\n      | amount |\n      | 40 |\n`)).toThrow('not allowed')
})
it('rejects scenarios without coverage metadata', () => {
  expect(() => read('Feature: Cart\n  @id:purchase\n  Scenario: Buy\n    Then an order\n')).toThrow('coverage tag')
})
it('rejects scenarios without a Then outcome', () => {
  expect(() => read('@cart\nFeature: Cart\n  @id:purchase\n  Scenario: Buy\n    When I buy\n')).toThrow('Then outcome')
})
it('rejects duplicate scenario identities', () => {
  expect(() => read('@cart\nFeature: Cart\n  @id:purchase\n  Scenario: Buy\n    Then an order\n  @id:purchase\n  Scenario: Buy again\n    Then another order\n')).toThrow('Duplicate')
})
