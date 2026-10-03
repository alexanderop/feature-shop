# GitHub Actions selection proof

Verified on 2026-10-03 against the public [feature-shop repository](https://github.com/alexanderop/feature-shop).

Four independent pull requests each changed exactly one application file. Each PR targeted the same main commit and retained the existing acceptance scenarios.

| Change | Only changed file | E2E tests executed | Result | Actions evidence |
| --- | --- | --- | --- | --- |
| [Checkout PR](https://github.com/alexanderop/feature-shop/pull/1) | `app/features/checkout/CheckoutView.vue` | 4/14 | Passed | [Run](https://github.com/alexanderop/feature-shop/actions/runs/37102140604) |
| [Search PR](https://github.com/alexanderop/feature-shop/pull/2) | `app/features/search/CatalogView.vue` | 5/14 | Passed | [Run](https://github.com/alexanderop/feature-shop/actions/runs/37102142928) |
| [Cart PR](https://github.com/alexanderop/feature-shop/pull/3) | `app/features/cart/CartView.vue` | 10/14 | Passed | [Run](https://github.com/alexanderop/feature-shop/actions/runs/37102146150) |
| [Shared PR](https://github.com/alexanderop/feature-shop/pull/4) | `app/assets/css/main.css` | 14/14 | Passed | [Run](https://github.com/alexanderop/feature-shop/actions/runs/37102149311) |

## What was checked

Downloaded each run's uploaded artifacts and inspected both `selection.json` and the actual `playwright.json` report. Checked that the changed-file list contained exactly the intended file. Compared selected scenario IDs with executed scenario IDs. Every run had zero failed, skipped, or flaky tests. The run's head SHA matched its PR branch.

The workflow's separate full-suite step was skipped for every PR. The shared styling PR still executed all 14 tests through the affected-test step because global changes deliberately fall back to the full set. Static analysis and all 33 unit/tooling tests ran on every PR.

The [initial main-branch run](https://github.com/alexanderop/feature-shop/actions/runs/37102066621) separately passed all 14 scenarios.

## Checkout selection

The checkout-only PR executed these four scenarios:

- `checkout-validation`
- `checkout-decline-retry`
- `checkout-success`
- `purchase-journey`

Isolated search, product-detail, and cart scenarios did not execute. The purchase journey remained selected because it traverses checkout.

## Dependency behavior

Search selected its four focused scenarios and the purchase journey. Cart selected its five scenarios, product-detail add-to-cart, three checkout scenarios, and the purchase journey. This is intentional dependency propagation. A cart change must verify its consumers.

The PRs remain open and unmerged as inspectable demonstrations. Their descriptions link to successful runs and list the exact executed scenario IDs. Local downloaded evidence is under `.verification/github/` and is ignored by Git. GitHub artifacts expire after the repository's retention period, while run links and this record remain available.

These results prove the tested changes and dependency map. They do not guarantee completeness for undeclared future dependencies. Enable `SHADOW_FULL_SUITE=true` to audit selected tests against a full run on every PR.
