# Instructions for coding agents working in this project

`AGENTS.md` is a file several coding agents read at the start of a session. If yours reads a file with another name, make that file point to this one rather than copying it, so that there is one set of instructions to keep up to date.

## Build and check

- `npm ci` installs the exact packages in `package-lock.json`. Do not add a package: every package must be on the allowlist in `checks/dependency-allowlist.json`, and adding one is a rule change of its own.
- `npm test` runs the functional tests.
- `npm run verify` runs every check. Run it before you say a change is done, and report any check that fails, with what it printed.

## Structure

Each module is a folder under `src/`. Its `index.ts` is its published interface; everything else in the folder, including `internal/`, belongs to the module. Shared code is in `src/lib/`. `checks/module-map.json` lists the modules and which modules each may use.

## Rules you must follow

Each is checked by `npm run verify`. The rule cards in `rule-cards/` say why, and what each check cannot see; the records in `decisions/` say what was decided.

- Use another module only through its `index.ts`. Never import from another module's `internal/` folder.
- Do not add a module, or a dependency between modules, without a line in the module map, and that line is a rule change.
- Write structured events only with `recordEvent` from `src/lib/events.ts`, and only with the fields `checks/telemetry-contract.json` lists for the event's type.
- Never put a person's name, email address or other personal details in an event or a log line. Use the identifier of the record instead.
- Never write a secret, such as a key or a password, in code, tests or logs. Read credentials from the environment.

## What you must not change

- The protected paths in `checks/protected-paths.json`: the checks, the tests that are checks, the rule cards, the planted changes, and the test, type-checking, secret-scan and continuous integration settings. They decide whether a change passes. A change to one is a change of its own, approved by the rule's owner, and never in the same change as code under `src/`. If the task seems to need one, stop and say so.
- `planted/` holds deliberately bad changes, one for each check, used only to show that the check can fail. Never copy from it.
- `observed/` holds recorded runs. Never edit them.

## Which source settles a disagreement

The code says what the system does. The rule cards and the decision records say what it must do. If a comment, a document or something you remember from an earlier session disagrees with them, follow them and report the disagreement.
