# Verification evidence

Verified locally on 2026-10-03 with Node 24.21.0, pnpm 10.28.2, and Playwright 1.63.0 Chromium on macOS.

## Automated results

| Check | Observed result |
| --- | --- |
| `pnpm check` | Oxlint, Nuxt and tooling TypeScript checks, 33 unit/tooling tests, and 14 Gherkin scenarios passed validation |
| `pnpm verify run --all --json` | 14 passed, zero failed, skipped, or flaky |
| Fresh-agent scenario | One independently authored Gherkin-only scenario passed through the CLI |
| Checkout mutation | Four affected scenarios selected, three failed on the wrong receipt total |
| Restored checkout | All 14 scenarios passed again |
| Undefined Gherkin steps | Validation returned exit code 2 with missing-step diagnostics |
| Unknown scenario and CLI flag | Both returned parseable invalid-result JSON with exit code 2 |
| Parallel verification lock | A second owner was refused, then a new owner succeeded after cleanup |

The browser suite covers search results, empty results, category filtering, keyboard search, product detail, cart changes, removal, reload persistence, independent browser contexts, checkout validation, declined-payment recovery, exact receipt totals, and the complete purchase journey.

## Agent acceptance

A separate agent read AGENTS.md and ran `pnpm --silent verify steps --feature cart --json`. It added only `tests/e2e/features/cart/agent-quantity.feature`. The scenario changes a cart to three backpacks and expects an exact €120.00 subtotal. No TypeScript step or page-object changes were needed.

The agent ran validation and `VERIFY_SKIP_BUILD=1 pnpm --silent verify run --scenario agent-three-backpacks --json`. The report recorded one passed test and no errors. The coordinator inspected the resulting scenario and retained it in the normal suite.

## Mutation experiment

Starting from the committed app, temporarily changed `formatMoney(result.receipt.totalMinor)` in CheckoutView.vue to add 100 cents. The selector chose checkout validation, checkout decline/retry, checkout success, and the purchase journey. It excluded all isolated search, detail, and cart scenarios.

`verify run --affected --json` returned exit code 1. Checkout validation passed. The three receipt scenarios failed their exact total assertions. The CLI reported their scenario IDs, failed steps, messages, and artifact paths. Restored the source in a finally block and reran the full suite successfully.

This proves one concrete dependency-selection case and that receipt assertions detect that defect. It does not prove completeness for every future dependency or guarantee faster total CI time. Build time remains part of verification.

## Visual and interactive checks

Inspected the built shop at 1440 × 1100 and 390 × 844. Used an isolated agent-browser session because the Computer Use runtime reported no available browsers.

Completed product navigation, add-to-cart, cart navigation, checkout form entry, and order confirmation at the mobile viewport. Verified that confirmation showed €40.00 and the cart count returned to zero. In a separate cart interaction, focused the native quantity control, typed 2, and pressed Tab. The quantity, header count, line total, and subtotal updated to two and €80.00.

The first ArrowDown/Enter attempt did not change the native selection. The subsequent digit/Tab interaction established the keyboard result. Automated keyboard search also passed. These checks do not constitute a complete accessibility audit.

Reviewed these captured images:

- [Desktop shop](screenshots/desktop.png)
- [Mobile shop](screenshots/mobile.png)
- [Mobile cart with keyboard focus](screenshots/cart-mobile.png)
- [Mobile checkout](screenshots/checkout-mobile.png)
- [Mobile receipt](screenshots/receipt-mobile.png)

## Local artifacts and limits

Ignored `.verification/` contains raw reports and traces for this checkout. The mutation record is `.verification/mutation-proof.json`. The restored full run is `.verification/1791007028854-38193/`. The independent agent run is `.verification/1791006134749-29094/`. Regenerate evidence with the commands above after cloning.

The repository is now public. Main and four real PRs passed GitHub Actions. See [remote selection proof](github-verification.md). No application deployment was performed. The browser gate currently uses desktop Chromium. Mobile layout was inspected manually. Checkout has no real payment integration or durable order storage.
