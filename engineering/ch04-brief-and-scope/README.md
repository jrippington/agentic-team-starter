# A brief's scope, checked

A task brief whose scope is written as paths, and a short program that compares the files a change touches with that scope. A path that ends in `/` covers everything under it. The rule: every change stays inside its brief.

## What is here

| File | What it holds |
|---|---|
| `brief.md` | The task brief, Q-12: a quote's summary shows the last day it can be accepted. Its "Scope and out-of-bounds" section lists the paths that may change and the paths that must not |
| `project/` | The small codebase the brief is about. Nothing here runs it; the change below is written against it |
| `change.patch` | The change under review, as a patch: what an agent or a colleague hands back |
| `variants/wider.patch` | The same change, with one more edit that is tempting and outside the brief |
| `checks/scope.ts` | The check |
| `observed/RUNS.md` | The runs this README describes, as recorded |

## What you need

Node.js 22 (22.12 or later) and npm, with network access to the npm registry, and Git for the undo.

## Run the check

```sh
npm install
npm run check
```

## What you should see

```text
Scope check: change.patch against brief.md

  in scope  src/quoting/summary.ts
  in scope  test/quoting/summary.test.ts

Passed: 2 files changed, every one inside the brief's scope.
```

## Make the bad change

The test needs a date 30 days after another, so the change also adds a small helper to the shared test support, where every module's tests could use it. It works, and its test passes. The brief puts `test/support/` out of bounds.

1. Run:

   ```sh
   cp variants/wider.patch change.patch
   ```

2. Run `npm run check`.

## What the check prints

The check names the file and the brief's line that rules it out, and exits with status 1:

```text
Scope check: change.patch against brief.md

  in scope  src/quoting/summary.ts
  in scope  test/quoting/summary.test.ts
  OUTSIDE   test/support/clock.ts: out of bounds (test/support/)

Failed: 1 of 3 files is outside the brief's scope. Take it out of
the change, or ask the brief's owner to widen the scope, as a decision of its own.
```

Any file that the brief neither puts in scope nor out of bounds is refused too, as "not in scope": a brief's scope says what may change, so anything it does not name is outside it.

Undo the change with `git restore change.patch`, and the check passes again.

## What the check does not catch

- Whether the change inside the scope is right. A wrong edit to `src/quoting/summary.ts` passes; the brief's acceptance evidence and its tests decide that.
- A scope drawn too wide when the brief was written. The check keeps a change within the brief; it cannot say whether the brief was a good one.
- Effects that are not in the patch: a command that changes a database, a file a build generates, a package installed outside the repository.
- A change to the brief itself. Any change that widens the scope and uses the wider scope in one patch should be refused by review: the brief belongs to its owner, and changing it is a decision of its own.

## In the book

*Engineering the Agentic Team*, Chapter 4.
