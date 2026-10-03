import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { generateMessages } from '@cucumber/gherkin'
import { SourceMediaType, IdGenerator, type FeatureChild, type RuleChild, type Tag } from '@cucumber/messages'
import { featureIds, type FeatureId, type Scenario } from './impact.ts'

export function filesUnder(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const path = join(root, entry.name)
    return entry.isDirectory() ? filesUnder(path) : entry.isFile() ? [path] : []
  }).sort()
}

export function readScenarios(cwd: string): Scenario[] {
  const result: Scenario[] = []
  const files = filesUnder(join(cwd, 'tests/e2e'))
  if (files.some(path => /\.(spec|test)\.[cm]?[jt]s$/.test(path))) throw new Error('E2E scenarios must use registered .feature files, not standalone specs')
  for (const path of files.filter(path => path.endsWith('.feature'))) {
    const file = relative(cwd, path)
    const envelopes = generateMessages(readFileSync(path, 'utf8'), file, SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN, {
      includeGherkinDocument: true, includePickles: true, includeSource: false, newId: IdGenerator.incrementing(),
    })
    const errors = envelopes.flatMap(envelope => envelope.parseError ? [envelope.parseError.message] : [])
    if (errors.length) throw new Error(`${file}: ${errors.join('; ')}`)
    const feature = envelopes.find(envelope => envelope.gherkinDocument)?.gherkinDocument?.feature
    if (!feature) throw new Error(`${file}: missing Feature`)
    const visit = (children: readonly (FeatureChild | RuleChild)[], inherited: readonly Tag[]) => {
      for (const child of children) {
        if ('rule' in child && child.rule) visit(child.rule.children, [...inherited, ...child.rule.tags])
        if (!child.scenario) continue
        const scenario = child.scenario
        const tags = [...inherited, ...scenario.tags].map(tag => tag.name)
        const ids = tags.filter(tag => tag.startsWith('@id:'))
        if (ids.length !== 1 || !/^@id:[a-z0-9-]+$/.test(ids[0]!)) throw new Error(`${file}:${scenario.location.line}: exactly one @id:slug required`)
        const coverage = tags.filter(tag => featureIds.includes(tag.slice(1) as FeatureId)).map(tag => tag.slice(1) as FeatureId)
        if (!coverage.length) throw new Error(`${file}:${scenario.location.line}: feature coverage tag required`)
        const executionTags = [...tags, ...scenario.examples.flatMap(example => example.tags.map(tag => tag.name))]
        if (executionTags.some(tag => /^@(skip|fixme|only|fail)(:|$)/.test(tag))) throw new Error(`${file}: disabled, expected-failure, or exclusive scenario is not allowed`)
        if (!scenario.steps.some(step => step.keyword.trim() === 'Then')) throw new Error(`${file}:${scenario.location.line}: scenario needs an explicit Then outcome`)
        result.push({ id: ids[0]!.slice(4), name: scenario.name, file, line: scenario.location.line, features: [...new Set(coverage)] })
      }
    }
    visit(feature.children, feature.tags)
  }
  const ids = new Set<string>()
  for (const scenario of result) {
    if (ids.has(scenario.id)) throw new Error(`Duplicate scenario ID ${scenario.id}`)
    ids.add(scenario.id)
  }
  if (!result.length) throw new Error('No registered scenarios found')
  return result
}
