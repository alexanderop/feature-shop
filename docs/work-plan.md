# Implementation plan

1. `how` over the affected subsystem. Complete. The research established explicit feature-to-scenario selection and Playwright-BDD.
2. `architect` for parallel design exploration. Complete. Compared a central registry and distributed manifests. A same-family independent judge preferred the central registry for this POC. Retained conservative shared dependency handling and validation.
3. Write the throughput checkpoint as four todo items.
   - Blocking first steps. Establish API, accessibility, and scenario metadata contracts before implementation.
   - Independent workstreams. Application, browser scenarios, and CLI infrastructure have separate file ownership.
   - Shared mutable state. Cookie carts isolate contexts. Only the coordinator changes package and tooling configuration.
   - Smallest safe decomposition. Three bounded owners cover the application, test suite, and orchestration without duplicate implementations.
4. Delegate code-writing to a subagent. In progress. Application and browser verification have separate owners.
5. Verify on the matching surface. Pending. Build, logic tests, CLI acceptance, real Playwright browser journeys, and visual inspection.
6. Rebase into small, ordered commits. Pending. New repository has no upstream branch to rebase. Commit verified local units.
7. If the design is contested, `interrogate` before shipping. Skip. The design comparison converged on the central registry.
8. Run Opening a PR only when requested or required. Skip. Deliver a verified local Git repository.

The typed registry records ownership, dependencies, and scenario coverage. Unknown files and global infrastructure select all tests. Gherkin owns expected behavior. Step definitions use typed fixtures and page objects. The CLI invokes the existing BDD and Playwright runners.
