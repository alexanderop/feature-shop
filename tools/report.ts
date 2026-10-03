import { z } from 'zod'

const errorSchema = z.object({ message: z.string().optional(), stack: z.string().optional() })
const resultSchema = z.object({
  status: z.string(),
  errors: z.array(errorSchema).default([]),
  steps: z.array(z.object({ title: z.string(), error: errorSchema.optional() })).default([]),
  attachments: z.array(z.object({ name: z.string(), path: z.string().optional() })).default([]),
})
const suiteSchema = z.object({
  suites: z.array(z.unknown()).default([]),
  specs: z.array(z.object({
    title: z.string(), tags: z.array(z.string()).default([]),
    tests: z.array(z.object({ expectedStatus: z.string(), results: z.array(resultSchema) })),
  })).default([]),
})
const reportSchema = z.object({
  stats: z.object({ expected: z.number().int().nonnegative(), unexpected: z.number().int().nonnegative(), skipped: z.number().int().nonnegative(), flaky: z.number().int().nonnegative() }),
  errors: z.array(z.unknown()), suites: z.array(z.unknown()),
})

export function summarizeReport(raw: unknown) {
  const report = reportSchema.parse(raw)
  const tests: { id?: string; name: string; expectedStatus: string; passed: boolean; errors: string[]; failedSteps: string[]; attachments: { name: string; path?: string }[] }[] = []
  const visit = (rawSuite: unknown) => {
    const suite = suiteSchema.parse(rawSuite)
    for (const spec of suite.specs) {
      for (const test of spec.tests) {
        tests.push({
          id: spec.tags.find(tag => tag.startsWith('id:'))?.slice(3),
          name: spec.title,
          expectedStatus: test.expectedStatus,
          passed: test.expectedStatus === 'passed' && test.results.length > 0 && test.results.every(result => result.status === 'passed'),
          errors: test.results.flatMap(result => result.errors.map(error => error.message ?? error.stack ?? 'Unknown test error')),
          failedSteps: test.results.flatMap(result => result.steps.filter(step => step.error).map(step => step.title)),
          attachments: test.results.flatMap(result => result.attachments),
        })
      }
    }
    suite.suites.forEach(visit)
  }
  report.suites.forEach(visit)
  return { stats: report.stats, errors: report.errors, tests }
}
