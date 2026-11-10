# Observed runs

The runs described in this exercise's README, as they were recorded.

| | |
|---|---|
| Date | 10 November 2026 |
| Operating system | Darwin 27.0.0 (from `uname -sr`) |
| Node.js | v22.23.1, with npm 10.9.8 |
| Tools | Vitest 5.1.0 (with Vite 8.3.7), PGlite 0.5.16 (`@electric-sql/pglite`), and TypeScript 6.0.3 |

Each run names the change made to the exercise, as it is in the repository, before the command ran. The output is copied exactly, with two edits: ANSI colour codes are removed, and the absolute path of the repository on the recording machine is shown as `<repository>`. Timings and start times differ from run to run.

## Run 1: the starting state

- Command: `npm test`
- Change: None. The planted bug is in place, and the test against real data is skipped.
- Exit status: 0

```text

> ch10-mock-and-mutation@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch10-mock-and-mutation

 ✓ test/premium-repository.test.ts > premium repository > queries the premiums table for the policy 1ms
 ✓ test/premium-repository.test.ts > premium repository > returns the premium from the row the database returns 0ms
 ✓ test/renewal-notice.test.ts > renewal notice > asks the repository for the policy's current premium 1ms
 ✓ test/renewal-notice.test.ts > renewal notice > shows the premium the repository returns 0ms
 ↓ test/premium-repository.real-data.test.ts > premium repository against real data > returns the premium of the latest version

 Test Files  2 passed | 1 skipped (3)
      Tests  4 passed | 1 skipped (5)
   Start at  18:38:47
   Duration  89ms (import 52%, transform 27%, worker 12%, tests 9%, environment 1%)
```

## Run 2: break the real query

- Command: `npm test`
- Change: In `src/premium-repository.ts`, `WHERE policy_id = $1` changed to `WHERE policy_id <> $1`.
- Exit status: 0

```text

> ch10-mock-and-mutation@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch10-mock-and-mutation

 ✓ test/renewal-notice.test.ts > renewal notice > asks the repository for the policy's current premium 1ms
 ✓ test/renewal-notice.test.ts > renewal notice > shows the premium the repository returns 0ms
 ✓ test/premium-repository.test.ts > premium repository > queries the premiums table for the policy 1ms
 ✓ test/premium-repository.test.ts > premium repository > returns the premium from the row the database returns 0ms
 ↓ test/premium-repository.real-data.test.ts > premium repository against real data > returns the premium of the latest version

 Test Files  2 passed | 1 skipped (3)
      Tests  4 passed | 1 skipped (5)
   Start at  18:38:47
   Duration  90ms (import 53%, transform 25%, worker 12%, tests 9%)
```

## Run 3: run the test against real data

- Command: `npm test`
- Change: Run 2 undone. In `test/premium-repository.real-data.test.ts`, `describe.skip(` changed to `describe(`.
- Exit status: 1

```text

> ch10-mock-and-mutation@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch10-mock-and-mutation

 ✓ test/renewal-notice.test.ts > renewal notice > asks the repository for the policy's current premium 1ms
 ✓ test/renewal-notice.test.ts > renewal notice > shows the premium the repository returns 0ms
 ✓ test/premium-repository.test.ts > premium repository > queries the premiums table for the policy 1ms
 ✓ test/premium-repository.test.ts > premium repository > returns the premium from the row the database returns 0ms
 × test/premium-repository.real-data.test.ts > premium repository against real data > returns the premium of the latest version 682ms
   → expected 41233 to be 45000 // Object.is equality

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  test/premium-repository.real-data.test.ts > premium repository against real data > returns the premium of the latest version
AssertionError: expected 41233 to be 45000 // Object.is equality

- Expected
+ Received

- 45000
+ 41233

 ❯ test/premium-repository.real-data.test.ts:28:21
     26|     const premium = await createPremiumRepository(db).findCurrentPremi…
     27|
     28|     expect(premium).toBe(45_000);
       |                     ^
     29|   });
     30| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 2 passed (3)
      Tests  1 failed | 4 passed (5)
   Start at  18:38:47
   Duration  774ms (tests 94%, import 3%, transform 1%, worker 1%)
```

## Run 4: fix the planted bug

- Command: `npm test`
- Change: As run 3, and in `src/premium-repository.ts`, `ORDER BY version` changed to `ORDER BY version DESC`.
- Exit status: 0

```text

> ch10-mock-and-mutation@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch10-mock-and-mutation

 ✓ test/premium-repository.test.ts > premium repository > queries the premiums table for the policy 1ms
 ✓ test/premium-repository.test.ts > premium repository > returns the premium from the row the database returns 0ms
 ✓ test/renewal-notice.test.ts > renewal notice > asks the repository for the policy's current premium 1ms
 ✓ test/renewal-notice.test.ts > renewal notice > shows the premium the repository returns 0ms
 ✓ test/premium-repository.real-data.test.ts > premium repository against real data > returns the premium of the latest version 685ms

 Test Files  3 passed (3)
      Tests  5 passed (5)
   Start at  18:38:48
   Duration  775ms (tests 94%, import 3%, transform 2%, worker 1%)
```

## Run 5: break the real query again

- Command: `npm test`
- Change: As run 4, and `WHERE policy_id = $1` changed to `WHERE policy_id <> $1`.
- Exit status: 1

```text

> ch10-mock-and-mutation@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch10-mock-and-mutation

 ✓ test/renewal-notice.test.ts > renewal notice > asks the repository for the policy's current premium 1ms
 ✓ test/renewal-notice.test.ts > renewal notice > shows the premium the repository returns 0ms
 ✓ test/premium-repository.test.ts > premium repository > queries the premiums table for the policy 1ms
 ✓ test/premium-repository.test.ts > premium repository > returns the premium from the row the database returns 0ms
 × test/premium-repository.real-data.test.ts > premium repository against real data > returns the premium of the latest version 698ms
   → expected 39000 to be 45000 // Object.is equality

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  test/premium-repository.real-data.test.ts > premium repository against real data > returns the premium of the latest version
AssertionError: expected 39000 to be 45000 // Object.is equality

- Expected
+ Received

- 45000
+ 39000

 ❯ test/premium-repository.real-data.test.ts:28:21
     26|     const premium = await createPremiumRepository(db).findCurrentPremi…
     27|
     28|     expect(premium).toBe(45_000);
       |                     ^
     29|   });
     30| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 2 passed (3)
      Tests  1 failed | 4 passed (5)
   Start at  18:38:49
   Duration  790ms (tests 94%, import 3%, transform 2%, worker 1%)
```
