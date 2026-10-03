# Fieldwork

Use pnpm and Node 24. Keep the Nuxt app feature-based. Read docs/architecture.md before changing dependencies or test ownership.

## Verify a change

1. Run `pnpm --silent verify steps --feature checkout --json` to discover registered steps and examples. Change the feature argument as needed.
2. Add a Gherkin scenario under `tests/e2e/features/<feature>/`. Give it a unique `@id:slug` and coverage tags for the features it exercises.
3. Run `pnpm verify validate`. Unknown or ambiguous steps must fail. Add TypeScript step definitions only when existing steps cannot express the behavior.
4. Run `pnpm verify run --scenario <id>`. Confirm a regression scenario fails for the expected reason before fixing the application.
5. Run `pnpm check`, then `pnpm verify run --affected`. This includes staged, unstaged, and untracked changes against HEAD. Use `--base REF` to include committed branch changes.
6. Inspect the JSON result and failure artifacts under `.verification/<run>/`. A missing report or zero executed tests is not a pass. Preserve expectations when fixing application defects.

For machine-readable output use `pnpm --silent verify <command> --json`. Tests execute against a fresh production build by default. `VERIFY_SKIP_BUILD=1` is only for rerunning an unchanged build.

## Boundaries

The central registry is `tools/impact.ts`. Cross-feature imports must match its dependency declarations. Use explicit imports across feature boundaries. Do not auto-import application feature components or composables. Shared infrastructure and unknown files select all tests.

Page objects own semantic locators and user actions. Step definitions connect them to Gherkin. Fixtures own setup and teardown. Factory data must be deterministic and independent of production calculations. Every scenario has a fresh browser context. Never share mutable carts across tests.

Prefer role and label locators, awaited Playwright assertions, and observable readiness. Do not use fixed sleeps, forced clicks, serial test dependencies, or assertion weakening to obtain a pass. Keep real Nuxt endpoints in purchase journeys. The payment adapter is deliberately simulated.

Do not edit generated `.features-gen` files. Do not commit `.verification`, traces, cookies, or build outputs. Do not push or deploy without an explicit request.
