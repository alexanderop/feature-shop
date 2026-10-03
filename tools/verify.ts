#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { parseArgs } from 'node:util'
import { acquireLock, VerificationBusyError } from './lock.ts'
import { validateBoundaries } from './boundaries.ts'
import { changedFiles } from './git.ts'
import { featureIds, selectAffected, type Selection } from './impact.ts'
import { summarizeReport } from './report.ts'
import { readScenarios } from './scenarios.ts'

const cwd = resolve(import.meta.dirname, '..')
const parsed = (() => {
try { return parseArgs({
  allowPositionals: true,
  options: {
    json: { type: 'boolean' }, all: { type: 'boolean' }, affected: { type: 'boolean' }, changed: { type: 'boolean' },
    base: { type: 'string' }, head: { type: 'string' }, scenario: { type: 'string' }, feature: { type: 'string' },
    help: { type: 'boolean' }, headed: { type: 'boolean' },
  },
}) } catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  if (process.argv.includes('--json')) process.stdout.write(`${JSON.stringify({ schemaVersion: 1, status: 'invalid', message })}\n`)
  else process.stderr.write(`${message}\n`)
  process.exit(2)
}
})()
const { values, positionals } = parsed
const command = positionals[0] ?? 'help'
const emit = (data: object) => process.stdout.write(`${JSON.stringify(data, null, 2)}\n`)
const log = (message: string) => (values.json ? process.stderr : process.stdout).write(`${message}\n`)

async function execute(args: string[], env: Record<string, string> = {}) {
  return await new Promise<{ code: number; output: string }>((resolveResult, reject) => {
    const child = spawn('pnpm', ['exec', ...args], { cwd, detached: process.platform !== 'win32', env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] })
    let output = ''
    child.stdout.on('data', (chunk: Buffer) => { output += chunk.toString(); if (!values.json) process.stderr.write(chunk) })
    child.stderr.on('data', (chunk: Buffer) => { output += chunk.toString(); process.stderr.write(chunk) })
    const cancel = () => {
      if (child.pid && process.platform !== 'win32') { try { process.kill(-child.pid, 'SIGTERM') } catch {} }
      else child.kill('SIGTERM')
    }
    process.once('SIGINT', cancel)
    process.once('SIGTERM', cancel)
    child.on('error', reject)
    child.on('close', (code) => {
      process.removeListener('SIGINT', cancel)
      process.removeListener('SIGTERM', cancel)
      resolveResult({ code: code ?? 3, output })
    })
  })
}

function plan(): Selection & { comparison?: { base: string; head: string } } {
  const scenarios = readScenarios(cwd)
  if ([values.all, values.affected || values.changed, Boolean(values.scenario)].filter(Boolean).length > 1) throw new Error('Choose one of --all, --affected, or --scenario')
  if (values.scenario) {
    const scenario = scenarios.find(item => item.id === values.scenario)
    if (!scenario) throw new Error(`Unknown scenario '${values.scenario}'`)
    return { schemaVersion: 1, mode: 'scenario', changedFiles: [], features: scenario.features, scenarios: [scenario], reasons: [] }
  }
  if (values.all) return { schemaVersion: 1, mode: 'all', changedFiles: [], features: [...featureIds], scenarios, reasons: [] }
  const comparison = changedFiles(cwd, values.base ?? 'HEAD', values.head)
  return { ...selectAffected(comparison.files, scenarios, comparison.fallback), comparison: { base: comparison.base, head: comparison.head } }
}

async function main() {
  if (values.help || command === 'help') {
    console.log(`Fieldwork verification\n\n  pnpm verify steps [--feature checkout] [--json]\n  pnpm verify validate [--json]\n  pnpm verify plan [--affected] [--base REF] [--head REF] [--json]\n  pnpm verify run --scenario ID [--headed] [--json]\n  pnpm verify run --affected [--base REF] [--json]\n  pnpm verify run --all [--json]\n\nWithout --head, affected selection includes staged, unstaged and untracked files.\nUse --head in CI for a committed PR comparison. Unknown files select all tests.\nExit codes: 0 passed, 1 test failure, 2 invalid input, 3 infrastructure failure.\nFor clean JSON when invoking through pnpm, use pnpm --silent verify ... --json.`)
    return
  }
  if (!['steps', 'validate', 'plan', 'run'].includes(command) || positionals.length > 1) throw new Error('Unknown command. Run pnpm verify --help')
  if (values.feature && !featureIds.includes(values.feature as typeof featureIds[number])) throw new Error(`Unknown feature '${values.feature}'`)
  if (command === 'steps') {
    const exported = await execute(['bddgen', 'export'])
    if (exported.code) throw new Error(exported.output)
    const steps = exported.output.split('\n').flatMap(line => {
      const match = /^\* (Given|When|Then) (.+)$/.exec(line.trim())
      return match ? [{ keyword: match[1], expression: match[2] }] : []
    })
    if (!steps.length) throw new Error('No executable steps discovered')
    const examples = readScenarios(cwd).filter(scenario => !values.feature || scenario.features.includes(values.feature as typeof featureIds[number]))
    if (values.json) emit({ schemaVersion: 1, steps, examples })
    else { log('\nAvailable executable steps'); steps.forEach(step => log(`  ${step.keyword} ${step.expression}`)); log('\nExample scenarios'); examples.forEach(example => log(`  ${example.id}  ${example.file}:${example.line}`)) }
    return
  }
  validateBoundaries(cwd)
  const selection = plan()
  if (command === 'plan') {
    if (values.json) emit(selection)
    else { log(`\n${selection.scenarios.length} scenarios selected (${selection.mode})`); selection.reasons.forEach(reason => log(`  ${reason.path}: ${reason.reason}${reason.features.length ? ` [${reason.features.join(', ')}]` : ''}`)); selection.scenarios.forEach(scenario => log(`  ${scenario.id}  ${scenario.file}:${scenario.line}`)) }
    return
  }
  const generated = await execute(['bddgen'])
  if (generated.code) throw new Error(`Gherkin validation failed\n${generated.output}`)
  if (command === 'validate') {
    const data = { schemaVersion: 1, status: 'valid', scenarios: readScenarios(cwd).length }
    if (values.json) emit(data)
    else log(`Validated ${data.scenarios} scenarios and executable step bindings.`)
    return
  }
  const runId = `${Date.now()}-${process.pid}`
  const artifactDir = join(cwd, '.verification', runId)
  mkdirSync(artifactDir, { recursive: true })
  writeFileSync(join(artifactDir, 'selection.json'), JSON.stringify(selection, null, 2))
  if (!selection.scenarios.length) {
    const result = { schemaVersion: 1, status: 'no-tests-selected', selection, artifactDir }
    writeFileSync(join(artifactDir, 'result.json'), JSON.stringify(result, null, 2))
    if (values.json) emit(result)
    else log('No E2E scenarios selected. See selection reasons. Validation passed.')
    return
  }
  const grep = selection.scenarios.map(scenario => `@id:${scenario.id}(?=\\s|$)`).join('|')
  const started = Date.now()
  const result = await execute(['playwright', 'test', '--grep', grep, ...(values.headed ? ['--headed'] : [])], {
    PLAYWRIGHT_JSON_OUTPUT_NAME: join(artifactDir, 'playwright.json'),
    VERIFY_ARTIFACT_DIR: artifactDir,
  })
  let report: ReturnType<typeof summarizeReport> | undefined
  try { report = summarizeReport(JSON.parse(readFileSync(join(artifactDir, 'playwright.json'), 'utf8'))) } catch {}
  const executed = report?.stats ? report?.stats.expected + report?.stats.unexpected + report?.stats.flaky : 0
  const infrastructure = !report?.stats || Boolean(report?.errors?.length) || executed === 0
  const passed = result.code === 0 && !infrastructure && report?.stats?.skipped === 0 && report?.stats?.flaky === 0 && report.tests.every(test => test.passed) && selection.scenarios.every(scenario => report.tests.some(test => test.id === scenario.id))
  const status = passed ? 'passed' : infrastructure ? 'infrastructure-failed' : 'failed'
  const summary = { schemaVersion: 1, status, durationMs: Date.now() - started, selection, stats: report?.stats, failures: report?.tests.filter(test => !test.passed), artifactDir, report: join(artifactDir, 'playwright.json') }
  writeFileSync(join(artifactDir, 'runner.log'), result.output)
  writeFileSync(join(artifactDir, 'result.json'), JSON.stringify(summary, null, 2))
  if (values.json) emit(summary)
  else log(`\n${status}: ${executed} tests. Evidence: ${artifactDir}`)
  process.exitCode = passed ? 0 : infrastructure ? 3 : 1
}

let release: (() => void) | undefined
async function run() {
  if (['steps', 'validate', 'run'].includes(command) && !values.help) release = acquireLock(cwd)
  try { await main() } finally { release?.() }
}
run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  if (values.json) emit({ schemaVersion: 1, status: error instanceof VerificationBusyError ? 'infrastructure-failed' : 'invalid', message })
  else process.stderr.write(`${message}\n`)
  process.exitCode = error instanceof VerificationBusyError ? 3 : 2
})
