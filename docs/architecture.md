# Feature ownership and verification

Fieldwork separates search, product detail, cart, and checkout in `app/features`. Thin Nuxt pages import feature views explicitly. The catalog is immutable. Nitro endpoints reconstruct prices from server-owned products. The cart cookie contains product IDs and quantities, never trusted prices. Checkout is a simulation without a durable order database.

## Selection model

`tools/impact.ts` is the single ownership and dependency registry. A changed file selects its owner and reverse dependents. A scenario is selected when any of its coverage tags intersects those affected features. A changed journey file selects its own scenarios.

Product detail imports cart behavior, so cart changes also select product-detail scenarios. Checkout depends on cart and catalog. Search depends on catalog. The complete purchase journey declares every feature it traverses.

Shared contracts, app shell, shared fixtures, page objects outside registered feature folders, tooling, configuration, lockfiles, and unknown paths select the full suite. Only README.md, AGENTS.md, and docs/ are explicitly excluded as non-runtime documentation. Do not place runtime data there.

Static validation checks explicit cross-feature imports and cycles. It is a guard against common drift, not a complete JavaScript dependency analyzer. HTTP calls, Nuxt auto-imports, dynamic imports, global styles, and behavior outside static imports still require conservative ownership and full-suite verification. Application feature code uses explicit imports.

The header consumes cart data on every route. Full purchase coverage runs for cart changes. This selection contract does not claim that every possible shell regression is exercised by every selected feature suite. Global shell changes run everything.

## Browser test structure

Gherkin defines business expectations. Playwright-BDD generates disposable tests. Typed fixtures inject page objects. Page objects encapsulate locators and user actions. Then steps use Playwright's retrying assertions with explicit expected values.

Browser contexts isolate cart cookies. API setup creates prerequisites for focused scenarios. The purchase journey uses the UI to search, navigate, add items, change quantity, and submit checkout. Separate context and reload scenarios verify isolation and persistence.

The agent CLI delegates generation, browser execution, server lifecycle, and reporting to Playwright-BDD and Playwright. It does not interpret natural language at runtime. A new Gherkin expression needs a real step implementation before it can execute.

## Design choice

Two design candidates compared a central registry with distributed manifests and a generated graph. A separate same-family model review recommended the central registry. The chosen design avoids discovery and generated metadata infrastructure for four features. It retains dependency validation and conservative shared-file behavior from the alternative.

Model the Domain shaped the typed cart, receipt result, and registry. Compose Vue Components shaped focused feature views and explicit dependencies. Test Where the Failure Happens keeps purchase verification against the built Nuxt server.

## Documentation used

- [Playwright fixtures](https://playwright.dev/docs/test-fixtures)
- [Page object models](https://playwright.dev/docs/pom)
- [Test isolation](https://playwright.dev/docs/browser-contexts)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright-BDD](https://github.com/vitalets/playwright-bdd)
- [Playwright CI and changed-test limitations](https://playwright.dev/docs/ci#fail-fast)
