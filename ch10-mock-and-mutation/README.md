# Mock and mutation

A small service whose tests only check that a mock was called, over a bug planted in the real query. The tests pass. You break the real query further and they still pass; then you run one test against real data, and it fails on the planted bug. The rule: a test must be able to fail when the real thing breaks.

## What is here

| File | What it holds |
|---|---|
| `src/schema.sql` | One table, `policy_premiums`. Each adjustment to a policy writes a new version of its annual premium, and the current premium is the one with the highest version |
| `src/premium-repository.ts` | `findCurrentPremium`, with the planted bug in its SQL |
| `src/renewal-notice.ts` | The service: the line of a renewal notice that tells the customer what they pay now |
| `src/db.ts` | Opens a new database in memory, with the schema applied |
| `test/renewal-notice.test.ts`, `test/premium-repository.test.ts` | Four tests, each of which replaces the repository or the database with a mock |
| `test/premium-repository.real-data.test.ts` | One test against real rows in a real database, skipped until you turn it on |
| `observed/RUNS.md` | The runs this README describes, as recorded |

The database is PGlite, PostgreSQL compiled to WebAssembly, which runs inside Node with no server to install.

## What you need

Node.js 22 (22.12 or later) and npm.

## Run the tests

```sh
npm install
npm test
```

## What you should see

Four tests pass and one is skipped:

```text
 ✓ test/premium-repository.test.ts > premium repository > queries the premiums table for the policy 1ms
 ✓ test/premium-repository.test.ts > premium repository > returns the premium from the row the database returns 0ms
 ✓ test/renewal-notice.test.ts > renewal notice > asks the repository for the policy's current premium 1ms
 ✓ test/renewal-notice.test.ts > renewal notice > shows the premium the repository returns 0ms
 ↓ test/premium-repository.real-data.test.ts > premium repository against real data > returns the premium of the latest version

 Test Files  2 passed | 1 skipped (3)
      Tests  4 passed | 1 skipped (5)
```

## Make the bad change: break the real query

This is mutation testing by hand: break the thing the tests say they test, and see whether any test fails.

1. Open `src/premium-repository.ts`.
2. Change `WHERE policy_id = $1` to `WHERE policy_id <> $1`. The query now returns some other policy's premium.
3. Run `npm test`.

## What the tests print

Nothing changes. The same four tests pass, and `npm test` exits with status 0:

```text
 Test Files  2 passed | 1 skipped (3)
      Tests  4 passed | 1 skipped (5)
```

None of the four can fail when the query is wrong, because none of them runs it. The mocks answer in its place, and one test checks only that the mock was called with a string containing `FROM policy_premiums`.

Undo the change with `git restore src/premium-repository.ts`.

## Run one test against real data

1. Open `test/premium-repository.real-data.test.ts`. It puts three rows in a real database: two versions of the premium for policy `POL-4001` (41233 pence, then 45000) and one for `POL-4002`.
2. Change `describe.skip(` to `describe(`.
3. Run `npm test`.

## What the test prints

The test against real data fails, and `npm test` exits with status 1:

```text
 × test/premium-repository.real-data.test.ts > premium repository against real data > returns the premium of the latest version 682ms
   → expected 41233 to be 45000 // Object.is equality
```

The query returned the first version of the premium, not the latest. That is the planted bug: `ORDER BY version` puts the oldest version first, and `LIMIT 1` takes it.

## Fix it

1. In `src/premium-repository.ts`, change `ORDER BY version` to `ORDER BY version DESC`.
2. Run `npm test`. All five tests pass:

   ```text
    Test Files  3 passed (3)
         Tests  5 passed (5)
   ```

3. Break the query again: change `WHERE policy_id = $1` to `WHERE policy_id <> $1`, and run `npm test`. This time a test fails, because it reads the other policy's premium:

   ```text
    × test/premium-repository.real-data.test.ts > premium repository against real data > returns the premium of the latest version 698ms
      → expected 39000 to be 45000 // Object.is equality
   ```

The suite can now fail when the real thing breaks. A mutation-testing tool, such as StrykerJS, makes changes like these automatically, many at a time, and reports each one that no test noticed.

Put the exercise back as it started with `git restore src test`.

## What the check does not catch

- A test that passes for the wrong reason. In the test data, the latest version of the premium is also the highest, so a query that returned the highest premium would pass too.
- Assumptions shared by the test and the code. If whoever wrote the query also wrote the test, believing that version 1 was the current one, the query and the expected value would be wrong the same way, and the test would pass. Someone other than the code's author writes or reviews the expected answer.
- What a test should use instead of its mock. Breaking the real thing shows that a test cannot fail; it does not say how to fix the test. A mock is right for what you do not control, behind your own interface, such as an outside service. It is wrong for the thing the test exists to check, which here is the query.

## In the book

*Architecture for the Agentic Team*, Chapter 10.
