# New system template

A small TypeScript project to copy when you start a new system, with its architectural rules checked from the first change. It has one example module, the files that state each rule, a check for each rule, one verification command that runs them all, a continuous integration workflow, and one deliberately bad change for each check that shows the check can fail.

Unlike the exercises in this repository, this folder is not about one rule. Copy it, replace the example module with your own, and write your system in it.

## What is here

| Path | What it holds |
|---|---|
| `src/contacts/` | The example module: a list of contacts. `index.ts` is its published interface, the one file another module may import; `internal/contact-store.ts` keeps the contacts |
| `src/lib/` | Shared code, which every module may use and which uses no module: the structured-event helper (`events.ts`) and the call counter the budgets read (`metrics.ts`) |
| `test/` | The functional tests; `test/checks/` holds the tests that are checks, each reported by its file name |
| `checks/module-map.json` | The modules, and the modules each may use |
| `checks/dependency-rules.cjs` | The module-boundaries rule, built from the module map |
| `checks/existing-violations.json` | Violations of the module-boundaries rule present when it was switched on: none |
| `checks/dependency-allowlist.json` | The packages the project may use, each with its reason |
| `.secretlintrc.json` | The secret scan's rules |
| `checks/telemetry-contract.json` | Each event type, every field it may carry, which fields identify a person, and how long its events are kept: one event type |
| `checks/budgets.json` | What each path may spend, in counted calls: empty |
| `checks/protected-paths.json` | The files that decide whether a change passes |
| `checks/waivers.json` | Recorded, expiring exceptions to a rule: none |
| `checks/residual-judgement-register.json` | What no check covers, who reviews it, and when |
| `checks/verify.ts` | The verification command |
| `checks/prove.ts` | Applies each planted change to a copy and shows the check it fails |
| `planted/` | One planted bad change for each check, with the check it should fail |
| `decisions/` | Decision records: `blank.md` to copy, and `0001-modules-and-allowed-dependencies.md`, filled |
| `rule-cards/` | Rule cards: `blank.md` to copy, and `module-boundaries.md`, filled |
| `intent-page.md` | A blank intent page, with the eight steps |
| `AGENTS.md` | Instructions for coding agents working in the project |
| `.github/workflows/verify.yml` | Continuous integration: every check on every change |
| `observed/RUNS.md` | The runs this README describes, as recorded |

## What you need

Node.js 22 (22.12 or later), npm and Git.

## Run the checks

```sh
npm install
npm run verify
```

## What you should see

Every check passes, each reported by the name of the rule it enforces:

```text
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

A check that fails prints `FAIL`, its name and what it found, and `npm run verify` exits with status 1.

## The checks

| Check | The rule | Where the rule is stated |
|---|---|---|
| `typecheck` | The code compiles under TypeScript's strict settings | `tsconfig.json` |
| `tests` | The functional tests pass | `test/*.test.ts` |
| `module-boundaries` | A module is used only through its `index.ts`, and only by the modules the map allows; `src/lib/` uses no module; there are no cycles | `checks/module-map.json`, `checks/dependency-rules.cjs` |
| `dependency-allowlist` | Every package that ships with the application, and every development tool, is on the allowlist with its reason | `checks/dependency-allowlist.json` |
| `no-secrets` | No credential in the code, the tests, the checks or the records | `.secretlintrc.json` |
| `performance-budgets` | Each path makes no more counted calls than its budget | `checks/budgets.json` |
| `telemetry-contract` | Every event is of a listed type and carries its required fields and no field outside its list; every type says how long it is kept, and every field whether it identifies a person | `checks/telemetry-contract.json` |
| `protected-paths` | A change to a protected path is not in the same change as code under `src/` | `checks/protected-paths.json` |
| `waivers-expire` | Every waiver names its rule, exception, owner and expiry, and none has expired | `checks/waivers.json` |
| `residual-judgement-register` | Every entry says what is not checked, why, who reviews it, in which review and when | `checks/residual-judgement-register.json` |

The protected-paths check compares the change with its base: the commit in the environment variable `VERIFY_BASE`, or the last commit if that is not set. Before the first commit there is nothing to compare with, and it passes.

## See each check fail

A check that has never failed may not be able to. `planted/` holds one bad change for each check. Each passes the type check and the functional tests, and should fail its own check and no other.

```sh
npm run prove
```

For each planted change, `npm run prove` copies the project to a temporary folder, makes it a Git repository, applies the change there, runs `npm run verify`, and prints what failed. It never changes your project. `npm run prove -- reach-in` runs one.

| Planted change | The change | The check it fails |
|---|---|---|
| `reach-in` | A new module, invitations, imports the contacts module's internal `tidyName` instead of using `index.ts`, and is not in the module map | `module-boundaries` |
| `unlisted-package` | A package that is not on the allowlist, and brings in a second one, is added to the application's dependencies | `dependency-allowlist` |
| `credential-in-code` | A key for a mail service is written into the code | `no-secrets` |
| `over-budget` | With a budget of one save for adding a contact, set first in `rule.patch`, adding a contact saves it twice | `performance-budgets` |
| `name-in-event` | The `contact.added` event carries the contact's name | `telemetry-contract` |
| `rule-and-code-together` | The same field is added to the event and to the telemetry contract in one change | `protected-paths` |
| `expired-waiver` | A waiver that expired on 30 June 2026 is still listed | `waivers-expire` |
| `register-entry-without-reviewer` | A register entry names no reviewer | `residual-judgement-register` |

Each prints, for example:

```text
name-in-event: The contact.added event carries the contact's name as well as its identifier.
  Planted to fail: telemetry-contract. Failed: telemetry-contract. As planted.
  FAIL  telemetry-contract
        every event carries the fields its type lists, and no others
          AssertionError: contact.added carries name, which checks/telemetry-contract.json does not list for it: expected [ Array(1) ] to deeply equal []
```

`observed/RUNS.md` has the output for all eight. The key in `planted/credential-in-code/change.patch` is a stand-in, `FAKE` six times, in the format the scan's own pattern describes; the scan does not read `planted/`.

## Start a project from it

1. Copy this folder to where the new project will live, and make that folder a Git repository:

   ```sh
   cp -R new-system-template ../my-system
   cd ../my-system
   git init
   ```

2. Run `npm install`, then `npm run verify` and `npm run prove`. Every check passes, and every planted change fails its check.
3. Commit, so that the protected-paths check has a base to compare each later change with.
4. Write the intent page, `intent-page.md`, for the system you are about to build.
5. Replace the example module with your first one. Rename `src/contacts/`, its line in `checks/module-map.json`, its event type in `checks/telemetry-contract.json`, its path in `test/checks/performance-budgets.test.ts` and the code the telemetry test runs in `test/checks/telemetry-contract.test.ts`. Update the planted changes that name the module, and run `npm run prove` to see that each still fails its check. These are rule changes: make them in a change of their own, before the code that needs them.
6. Replace the secret scan's example pattern in `.secretlintrc.json` with the formats of your own credentials.
7. Change the package name in `package.json`, and add your own licence for your own code.

From then on, for each rule you add: state it in a file under `checks/`, write a check that runs in `npm run verify`, add a planted change to `planted/` that the check fails, write its rule card and its decision record, and add to the register what the check cannot see. A test in `test/checks/` is reported by `npm run verify` under its file name, with no other change.

If the code already breaks the module-boundaries rule when you switch it on, list the violations in `checks/existing-violations.json` with `npx depcruise src --config checks/dependency-rules.cjs --output-type baseline --output-to checks/existing-violations.json`, and remove each line in the change that fixes it. The list may only shrink.

## What the checks do not catch

Each rule card names what its check cannot see, and the register in `checks/residual-judgement-register.json` names who reviews it. Three are listed to start with: whether a module boundary is in the right place, whether each event field is marked correctly as identifying a person and kept for a period the organisation may keep it, and whether a package on the allowlist is safe. More generally:

- A check sees the code and the files it is given. A dependency through a shared database table, a credential in a format no pattern describes, or an event written on a path no test runs is not seen.
- A budget counts calls. It is not a measurement of time, and it says nothing about a path with no budget.
- The checks run on every change only if continuous integration runs them and the repository does not let a change merge without them. Set that up on the repository host; nothing in this folder can.

## In the book

*Architecture for the Agentic Team*, Chapter 13, and Chapter 10 for showing that each check can fail.

## Licence

MIT, as for the rest of this repository. This folder has its own copy, [LICENSE](LICENSE), so that a copy of the folder includes it.
