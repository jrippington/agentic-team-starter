# Observed runs

The runs described in this template's README, as they were recorded.

| | |
|---|---|
| Date | 13 November 2026 |
| Operating system | Darwin 27.0.0 (from `uname -sr`) |
| Node.js | v22.23.1, with npm 10.9.8 |
| Tools | TypeScript 6.0.3, Vitest 5.1.0 (with Vite 8.3.7), dependency-cruiser 18.7.2, secretlint 13.1.0 with `@secretlint/secretlint-rule-preset-recommend` 13.1.0 and `@secretlint/secretlint-rule-pattern` 13.1.0, and tsx 4.23.15 |

Both runs were made on the template as it is in the repository, committed, with no change. The output is copied exactly. It holds no local path: `npm run prove` itself prints the path of each temporary copy as `<copy>`, and both commands were run with colour turned off.

## Run 1: every check

- Command: `npm run verify`
- Change: None.
- Exit status: 0

```text

> new-system-template@1.0.0 verify
> tsx checks/verify.ts

PASS  typecheck
PASS  tests
PASS  module-boundaries
PASS  dependency-allowlist
PASS  no-secrets
PASS  performance-budgets
PASS  telemetry-contract
PASS  protected-paths
PASS  waivers-expire
PASS  residual-judgement-register

All 10 checks passed.
```

## Run 2: each planted change

- Command: `npm run prove`
- Change: None. Each planted change is applied to a temporary copy, never to the template.
- Exit status: 0

```text

> new-system-template@1.0.0 prove
> tsx checks/prove.ts

credential-in-code: A key for a mail service is written into the code, for trying invitations on a laptop.
  Planted to fail: no-secrets. Failed: no-secrets. As planted.
  FAIL  no-secrets
        <copy>/src/contacts/internal/mail.ts
          2:31  error  [PATTERN] found matching ******************: *********************************  @secretlint/secretlint-rule-pattern
        ✖ 1 problem (1 error, 0 warnings, 0 infos)

expired-waiver: A waiver for the performance budget, which expired on 30 June 2026, is still listed.
  Planted to fail: waivers-expire. Failed: waivers-expire. As planted.
  FAIL  waivers-expire
        the waiver for performance-budgets (add-contact may save a contact twice while the contact store is replaced), owned by The owner of the contacts module, expired on 2026-06-30

name-in-event: The contact.added event carries the contact's name as well as its identifier.
  Planted to fail: telemetry-contract. Failed: telemetry-contract. As planted.
  FAIL  telemetry-contract
        every event carries the fields its type lists, and no others
          AssertionError: contact.added carries name, which checks/telemetry-contract.json does not list for it: expected [ Array(1) ] to deeply equal []

over-budget: With a budget of one save for adding a contact, adding a contact saves it twice: once as given and once with its name tidied.
  Planted to fail: performance-budgets. Failed: performance-budgets. As planted.
  FAIL  performance-budgets
        every path stays within its budget
          AssertionError: add-contact made 2 calls to contacts.save; its budget is 1: expected [ Array(1) ] to deeply equal []

reach-in: A new module, invitations, imports the contacts module's internal tidyName instead of using the contacts module's index.ts, and is not in the module map.
  Planted to fail: module-boundaries. Failed: module-boundaries. As planted.
  FAIL  module-boundaries
          error published-interface-only: src/invitations/index.ts → src/contacts/internal/contact-store.ts
          error module-in-map: src/invitations/index.ts → src/contacts/internal/contact-store.ts
        x 2 dependency violations (2 errors, 0 warnings). 6 modules, 6 dependencies cruised.

register-entry-without-reviewer: A register entry for the wording of invitations names no reviewer.
  Planted to fail: residual-judgement-register. Failed: residual-judgement-register. As planted.
  FAIL  residual-judgement-register
        invitation-wording has no reviewer

rule-and-code-together: The contact's name is added to the contact.added event, and to the telemetry contract's list of that event's fields, in the same change.
  Planted to fail: protected-paths. Failed: protected-paths. As planted.
  FAIL  protected-paths
        this change touches protected paths (checks/telemetry-contract.json) and the application's code (src/contacts/index.ts) together; make the rule change a change of its own

unlisted-package: A package for tidying text, which is not on the allowlist and brings in a second package, is added to the application's dependencies.
  Planted to fail: dependency-allowlist. Failed: dependency-allowlist. As planted.
  FAIL  dependency-allowlist
        tidy-text 2.1.0, a dependency of the application named in package.json, is not on the allowlist
        text-case 1.4.2 ships with the application, brought in by tidy-text, and is not on the allowlist

All 8 planted changes failed the check each was planted to fail, and no other.
```
