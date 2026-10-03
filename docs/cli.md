# Verification CLI reference

All commands run from this project. Add `--json` for a versioned JSON response. Use `pnpm --silent` to suppress the package manager banner. Child-process diagnostics use stderr.

| Command | Result |
| --- | --- |
| `pnpm verify steps` | Registered Gherkin expressions and scenario examples |
| `pnpm verify steps --feature checkout` | All expressions with checkout examples |
| `pnpm verify validate` | Gherkin parse, ID, coverage, boundary, and binding checks |
| `pnpm verify plan --affected` | Selected scenarios and per-file explanations |
| `pnpm verify plan --all` | Entire scenario inventory |
| `pnpm verify run --scenario checkout-success` | One identified scenario |
| `pnpm verify run --affected` | Selection followed by browser execution |
| `pnpm verify run --all` | Every scenario |

`--changed` aliases `--affected`. `--all`, `--affected`, and `--scenario` are mutually exclusive. `--headed` displays the test browser.

`--base REF` defaults to HEAD. Without `--head`, selection combines the merge-base comparison with staged, unstaged, and untracked files. With `--head REF`, it compares committed revisions only. Old and new rename paths and deleted paths participate in selection.

Exit code 0 means the command succeeded. An explicitly empty selection is reported as `no-tests-selected`. Exit code 1 means browser tests failed or did not meet the pass policy. Exit code 2 means invalid arguments, scenario metadata, or step bindings. Exit code 3 means the runner could not establish a valid test result.

Each browser run writes `selection.json`, `result.json`, `runner.log`, and `playwright.json` beneath `.verification/<timestamp>-<pid>/`. HTML reports and failure traces use that run directory too. The Playwright JSON report contains failed steps, errors, source locations, and attachments.

Runs build the application before starting it. `VERIFY_SKIP_BUILD=1` skips compilation when the existing production build is known to match the source. This flag does not reuse an existing server. Port 3401 must be available. The initial POC serializes CLI runs against that port.
