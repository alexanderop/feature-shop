import { expect, it } from 'vitest'
import { summarizeReport } from '../../tools/report'

it('does not accept an expected failure as successful verification', () => {
  const report = summarizeReport({
    stats: { expected: 1, unexpected: 0, skipped: 0, flaky: 0 }, errors: [],
    suites: [{ specs: [{ title: 'Broken checkout', tags: ['id:checkout-success'], tests: [{ expectedStatus: 'failed', results: [{ status: 'failed', errors: [{ message: 'Wrong total' }], steps: [{ title: 'Then my receipt total is "40.00"', error: { message: 'Wrong total' } }] }] }] }] }],
  })
  expect(report.tests[0]).toMatchObject({ id: 'checkout-success', passed: false, errors: ['Wrong total'], failedSteps: ['Then my receipt total is "40.00"'] })
})
it('rejects malformed runner output instead of producing a green result', () => {
  expect(() => summarizeReport({ status: 'passed' })).toThrow()
})
