# Observed runs

The runs described in this example's README, as they were recorded.

| | |
|---|---|
| Date | 11 November 2026 |
| Operating system | Darwin 27.0.0 (from `uname -sr`) |
| Node.js | v22.23.1, with npm 10.9.8 |
| Tools | The scope check in `checks/scope.ts`, run by tsx 4.23.15 with TypeScript 6.0.3; Git 2.54.0 for the undo |

Each run names the change made to the example, as it is in the repository, before the command ran. The output is copied exactly; colour was turned off with `NO_COLOR=1`. The runs were made one after another in a fresh copy of the example, installed with `npm ci`.

## Run 1: the starting state

- Command: `npm run check`
- Change: None.
- Exit status: 0

```text

> ch04-brief-and-scope@1.0.0 check
> tsx checks/scope.ts

Scope check: change.patch against brief.md

  in scope  src/quoting/summary.ts
  in scope  test/quoting/summary.test.ts

Passed: 2 files changed, every one inside the brief's scope.
```

## Run 2: the bad change

- Command: `cp variants/wider.patch change.patch`
- Change: None. The command makes the change: `change.patch` becomes the wider change, which also edits `test/support/clock.ts`.
- Exit status: 0

The command printed nothing.

## Run 3: after the bad change

- Command: `npm run check`
- Change: As run 2.
- Exit status: 1

```text

> ch04-brief-and-scope@1.0.0 check
> tsx checks/scope.ts

Scope check: change.patch against brief.md

  in scope  src/quoting/summary.ts
  in scope  test/quoting/summary.test.ts
  OUTSIDE   test/support/clock.ts: out of bounds (test/support/)

Failed: 1 of 3 files is outside the brief's scope. Take it out of
the change, or ask the brief's owner to widen the scope, as a decision of its own.
```

## Run 4: undo the change

- Command: `git restore change.patch`
- Change: As run 3. The command puts `change.patch` back as it is in the repository.
- Exit status: 0

The command printed nothing.

## Run 5: after the undo

- Command: `npm run check`
- Change: None.
- Exit status: 0

```text

> ch04-brief-and-scope@1.0.0 check
> tsx checks/scope.ts

Scope check: change.patch against brief.md

  in scope  src/quoting/summary.ts
  in scope  test/quoting/summary.test.ts

Passed: 2 files changed, every one inside the brief's scope.
```
