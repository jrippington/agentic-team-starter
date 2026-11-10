# Observed runs

The runs described in this exercise's README, as they were recorded.

| | |
|---|---|
| Date | 10 November 2026 |
| Operating system | Darwin 27.0.0 (from `uname -sr`) |
| Node.js | v22.23.1, with npm 10.9.8 |
| Tools | Vitest 5.1.0 (with Vite 8.3.7), fast-check 4.10.2, jscpd 5.4.3, and TypeScript 6.0.3 |

Each run names the change made to the exercise, as it is in the repository, before the command ran. The output is copied exactly, with two edits: ANSI colour codes are removed, and the absolute path of the repository on the recording machine is shown as `<repository>`. Timings and start times differ from run to run, and so do fast-check's seed and the counterexample it shrinks to.

## Run 1: the tests at the start

- Command: `npm test`
- Change: None.
- Exit status: 0

```text

> ch04-invariant-and-duplication@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch04-invariant-and-duplication

 ✓ test/money.test.ts > Money > rounds 412.325 to 412.32, half to even 1ms
 ✓ test/money.test.ts > Money > rounds 412.335 to 412.34, half to even 0ms
 ✓ test/money.test.ts > Money > rounds 412.3333 to 412.33, half to even 0ms
 ✓ test/money.test.ts > Money > rounds 412.3250001 to 412.33, half to even 0ms
 ✓ test/money.test.ts > Money > rounds -412.325 to -412.32, half to even 0ms
 ✓ test/money.test.ts > Money > rounds 412 to 412.00, half to even 0ms
 ✓ test/policy.test.ts > policy record > owes the premium at binding, rounded by Money 1ms
 ✓ test/policy.test.ts > policy record > adds an adjustment to what the policy owes 0ms
 ✓ test/policy.test.ts > policy record > counts an adjustment delivered twice once 0ms
 ✓ test/premium-invariant.test.ts > amount owed equals the premium at binding plus every adjustment since, each counted once 6ms

 Test Files  3 passed (3)
      Tests  10 passed (10)
   Start at  18:37:34
   Duration  106ms (import 50%, transform 22%, tests 16%, worker 12%)
```

## Run 2: the duplication check at the start

- Command: `npm run check`
- Change: None.
- Exit status: 0

```text

> ch04-invariant-and-duplication@1.0.0 check
> jscpd

Using config from .jscpd.json
No duplicates found.
┌────────────┬────────────────┬─────────────┬──────────────┬──────────────┬──────────────────┬───────────────────┐
│ Format     │ Files analyzed │ Total lines │ Total tokens │ Clones found │ Duplicated lines │ Duplicated tokens │
├────────────┼────────────────┼─────────────┼──────────────┼──────────────┼──────────────────┼───────────────────┤
│ typescript │ 2              │ 82          │ 471          │ 0            │ 0 (0.00%)        │ 0 (0.00%)         │
├────────────┼────────────────┼─────────────┼──────────────┼──────────────┼──────────────────┼───────────────────┤
│ Total:     │ 2              │ 82          │ 471          │ 0            │ 0 (0.00%)        │ 0 (0.00%)         │
└────────────┴────────────────┴─────────────┴──────────────┴──────────────┴──────────────────┴───────────────────┘
Found 0 clones.
time: 16.061ms
```

## Run 3: the tests after the planted bug

- Command: `npm test`
- Change: In `src/policy.ts`, the line `amountOwed: policy.amountOwed.plus(adjustment.amount),` replaced by `amountOwed: adjustments.reduce((total, each) => total.plus(each.amount), policy.amountOwed),`.
- Exit status: 1

```text

> ch04-invariant-and-duplication@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch04-invariant-and-duplication

 ✓ test/money.test.ts > Money > rounds 412.325 to 412.32, half to even 1ms
 ✓ test/money.test.ts > Money > rounds 412.335 to 412.34, half to even 0ms
 ✓ test/money.test.ts > Money > rounds 412.3333 to 412.33, half to even 0ms
 ✓ test/money.test.ts > Money > rounds 412.3250001 to 412.33, half to even 0ms
 ✓ test/money.test.ts > Money > rounds -412.325 to -412.32, half to even 0ms
 ✓ test/money.test.ts > Money > rounds 412 to 412.00, half to even 0ms
 ✓ test/policy.test.ts > policy record > owes the premium at binding, rounded by Money 1ms
 ✓ test/policy.test.ts > policy record > adds an adjustment to what the policy owes 0ms
 ✓ test/policy.test.ts > policy record > counts an adjustment delivered twice once 0ms
 × test/premium-invariant.test.ts > amount owed equals the premium at binding plus every adjustment since, each counted once 10ms
   → Property failed after 1 tests
{ seed: 511481450, path: "0:0:1:0:2:1:1:1:1:1:1:1:1:1:3:2:2:2:2:2:2:2:2:2:2:2:2:2:2:3:4:4", endOnFailure: true }
Counterexample: ["100.0000",[{"id":"ADJ-2","pence":-1},{"id":"ADJ-1","pence":0}],[]]
Shrunk 31 time(s)

Hint: Enable verbose mode in order to have the list of all failing values encountered during the run

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  test/premium-invariant.test.ts > amount owed equals the premium at binding plus every adjustment since, each counted once
Error: Property failed after 1 tests
{ seed: 511481450, path: "0:0:1:0:2:1:1:1:1:1:1:1:1:1:3:2:2:2:2:2:2:2:2:2:2:2:2:2:2:3:4:4", endOnFailure: true }
Counterexample: ["100.0000",[{"id":"ADJ-2","pence":-1},{"id":"ADJ-1","pence":0}],[]]
Shrunk 31 time(s)

Hint: Enable verbose mode in order to have the list of all failing values encountered during the run
 ❯ buildError node_modules/fast-check/lib/fast-check.js:2469:16
 ❯ throwIfFailed node_modules/fast-check/lib/fast-check.js:2476:8
 ❯ reportRunDetails node_modules/fast-check/lib/fast-check.js:2492:14
 ❯ Module.assert node_modules/fast-check/lib/fast-check.js:2662:7
 ❯ test/premium-invariant.test.ts:28:6
     26|
     27| test('amount owed equals the premium at binding plus every adjustment …
     28|   fc.assert(
       |      ^
     29|     fc.property(unroundedPremium, adjustments, repeats, (premium, made…
     30|       const deliveries =

Caused by: AssertionError: amount owed: expected '99.98' to be '99.99' // Object.is equality

Expected: "99.99"
Received: "99.98"

 ❯ test/premium-invariant.test.ts:42:59
 ❯ Property.predicate node_modules/fast-check/lib/fast-check.js:1355:99
 ❯ Property.run node_modules/fast-check/lib/fast-check.js:1324:24
 ❯ propertyExecution node_modules/fast-check/lib/fast-check.js:2549:23
 ❯ run node_modules/fast-check/lib/fast-check.js:2639:91
 ❯ runIt node_modules/fast-check/lib/fast-check.js:2542:15
 ❯ check node_modules/fast-check/lib/fast-check.js:2655:14
 ❯ Module.assert node_modules/fast-check/lib/fast-check.js:2660:14
 ❯ test/premium-invariant.test.ts:28:6

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 2 passed (3)
      Tests  1 failed | 9 passed (10)
   Start at  18:37:35
   Duration  104ms (import 44%, tests 26%, transform 19%, worker 11%)
```

## Run 4: the duplication check after the copy

- Command: `npm run check`
- Change: The planted bug undone. The file `src/amount-to-collect.ts` added, holding a copy of `roundHalfEven` renamed `amountToCollect` and changed to round half up.
- Exit status: 1

```text

> ch04-invariant-and-duplication@1.0.0 check
> jscpd

Using config from .jscpd.json
Clone found (typescript)
 - amount-to-collect.ts [4:32 - 10:23] (7 lines, 92 tokens)
   money.ts [39:30 - 45:23]
┌────────────┬────────────────┬─────────────┬──────────────┬──────────────┬──────────────────┬───────────────────┐
│ Format     │ Files analyzed │ Total lines │ Total tokens │ Clones found │ Duplicated lines │ Duplicated tokens │
├────────────┼────────────────┼─────────────┼──────────────┼──────────────┼──────────────────┼───────────────────┤
│ typescript │ 3              │ 95          │ 596          │ 1            │ 7 (7.37%)        │ 92 (15.44%)       │
├────────────┼────────────────┼─────────────┼──────────────┼──────────────┼──────────────────┼───────────────────┤
│ Total:     │ 3              │ 95          │ 596          │ 1            │ 7 (7.37%)        │ 92 (15.44%)       │
└────────────┴────────────────┴─────────────┴──────────────┴──────────────┴──────────────────┴───────────────────┘
Found 1 clones.
time: 4.493ms
```

## Run 5: the tests with the copy in place

- Command: `npm test`
- Change: As run 4.
- Exit status: 0

```text

> ch04-invariant-and-duplication@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch04-invariant-and-duplication

 ✓ test/money.test.ts > Money > rounds 412.325 to 412.32, half to even 1ms
 ✓ test/money.test.ts > Money > rounds 412.335 to 412.34, half to even 0ms
 ✓ test/money.test.ts > Money > rounds 412.3333 to 412.33, half to even 0ms
 ✓ test/money.test.ts > Money > rounds 412.3250001 to 412.33, half to even 0ms
 ✓ test/money.test.ts > Money > rounds -412.325 to -412.32, half to even 0ms
 ✓ test/money.test.ts > Money > rounds 412 to 412.00, half to even 0ms
 ✓ test/policy.test.ts > policy record > owes the premium at binding, rounded by Money 1ms
 ✓ test/policy.test.ts > policy record > adds an adjustment to what the policy owes 0ms
 ✓ test/policy.test.ts > policy record > counts an adjustment delivered twice once 0ms
 ✓ test/premium-invariant.test.ts > amount owed equals the premium at binding plus every adjustment since, each counted once 6ms

 Test Files  3 passed (3)
      Tests  10 passed (10)
   Start at  18:37:35
   Duration  93ms (import 46%, tests 22%, transform 20%, worker 11%)
```
