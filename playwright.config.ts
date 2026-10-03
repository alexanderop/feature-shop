import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

const testDir = defineBddConfig({
  features: 'tests/e2e/**/*.feature',
  steps: ['tests/e2e/features/**/*.steps.ts', 'tests/e2e/fixtures/test.ts'],
  outputDir: '.features-gen',
  missingSteps: 'fail-on-gen',
})

const artifactDir = process.env.VERIFY_ARTIFACT_DIR

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  outputDir: artifactDir ? path.join(artifactDir, 'test-results') : 'test-results',
  reporter: [
    ['list'],
    ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME ?? 'test-results/results.json' }],
    ['html', { outputFolder: artifactDir ? path.join(artifactDir, 'html') : 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:3401',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: process.env.VERIFY_SKIP_BUILD === '1' ? 'node .output/server/index.mjs' : 'pnpm build && node .output/server/index.mjs',
    url: 'http://127.0.0.1:3401',
    env: { PORT: '3401', HOST: '127.0.0.1' },
    reuseExistingServer: false,
    timeout: 180_000,
  },
})
