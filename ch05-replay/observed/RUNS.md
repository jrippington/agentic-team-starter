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
- Change: None.
- Exit status: 0

```text

> ch05-replay@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch05-replay

 ✓ test/replay.test.ts > payment notification handler > records one payment when the same notification is delivered twice 705ms
 ✓ test/replay.test.ts > payment notification handler > records a payment for each different notification 495ms
 ✓ test/replay.test.ts > payment notification handler > does not mark a notification as handled when its payment is not recorded 483ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  18:37:49
   Duration  1.78s (tests 98%, import 1%)
```

## Run 2: after the bad change

- Command: `npm test`
- Change: In `src/notification-handler.ts`, the body of `handleNotification` replaced by a single insert into `payments`, with no idempotency key and no transaction.
- Exit status: 1

```text

> ch05-replay@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch05-replay

 × test/replay.test.ts > payment notification handler > records one payment when the same notification is delivered twice 687ms
   → payments recorded: expected 2 to be 1 // Object.is equality
 ✓ test/replay.test.ts > payment notification handler > records a payment for each different notification 493ms
 ✓ test/replay.test.ts > payment notification handler > does not mark a notification as handled when its payment is not recorded 481ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  test/replay.test.ts > payment notification handler > records one payment when the same notification is delivered twice
AssertionError: payments recorded: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ test/replay.test.ts:34:62
     32|     await handleNotification(db, succeeded);
     33|
     34|     expect(await countRows('payments'), 'payments recorded').toBe(1);
       |                                                              ^
     35|   });
     36|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 2 passed (3)
   Start at  18:37:51
   Duration  1.75s (tests 99%, import 1%)
```

## Run 3: after the half fix

- Command: `npm test`
- Change: The body replaced again: the notification identifier recorded first, then the payment, as two separate statements outside a transaction.
- Exit status: 1

```text

> ch05-replay@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch05-replay

 ✓ test/replay.test.ts > payment notification handler > records one payment when the same notification is delivered twice 693ms
 ✓ test/replay.test.ts > payment notification handler > records a payment for each different notification 497ms
 × test/replay.test.ts > payment notification handler > does not mark a notification as handled when its payment is not recorded 486ms
   → notifications marked as handled: expected 1 to be +0 // Object.is equality

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  test/replay.test.ts > payment notification handler > does not mark a notification as handled when its payment is not recorded
AssertionError: notifications marked as handled: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ test/replay.test.ts:51:89
     49|     await expect(handleNotification(db, refused)).rejects.toThrow();
     50|
     51|     expect(await countRows('handled_notifications'), 'notifications ma…
       |                                                                                         ^
     52|   });
     53| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 2 passed (3)
   Start at  18:37:53
   Duration  1.76s (tests 99%, import 1%)
```

## Run 4: after the fix

- Command: `npm test`
- Change: The body restored: the notification identifier and the payment recorded in one transaction, as in the repository.
- Exit status: 0

```text

> ch05-replay@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch05-replay

 ✓ test/replay.test.ts > payment notification handler > records one payment when the same notification is delivered twice 681ms
 ✓ test/replay.test.ts > payment notification handler > records a payment for each different notification 492ms
 ✓ test/replay.test.ts > payment notification handler > does not mark a notification as handled when its payment is not recorded 489ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  18:37:55
   Duration  1.75s (tests 99%, import 1%)
```
