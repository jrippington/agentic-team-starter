# Observed runs

The runs described in this exercise's README, as they were recorded.

| | |
|---|---|
| Date | 10 November 2026 |
| Operating system | Darwin 27.0.0 (from `uname -sr`) |
| Node.js | v22.23.1, with npm 10.9.8 |
| Tools | Vitest 5.1.0 (with Vite 8.3.7) and TypeScript 6.0.3 |

Each run names the change made to the exercise, as it is in the repository, before the command ran. The output is copied exactly, with two edits: ANSI colour codes are removed, and the absolute path of the repository on the recording machine is shown as `<repository>`. Timings and start times differ from run to run.

## Run 1: the starting state

- Command: `npm test`
- Change: None.
- Exit status: 0

```text

> ch01-required-event-fields@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch01-required-event-fields

 ✓ test/telemetry-contract.test.ts > telemetry contract > payment.recorded carries its required fields 1ms
 ✓ test/telemetry-contract.test.ts > telemetry contract > payment.failed carries its required fields 0ms
 ✓ test/payment-handler.test.ts > payment handler > records a successful payment against its policy 1ms
 ✓ test/payment-handler.test.ts > payment handler > records a failed payment as failed 0ms

 Test Files  2 passed (2)
      Tests  4 passed (4)
   Start at  18:37:10
   Duration  92ms (import 44%, transform 27%, worker 16%, tests 12%)
```

## Run 2: after the bad change

- Command: `npm test`
- Change: In `src/payment-handler.ts`, the line `policyId: payment.policyId,` deleted from the `payment.recorded` event.
- Exit status: 1

```text

> ch01-required-event-fields@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch01-required-event-fields

 ✓ test/payment-handler.test.ts > payment handler > records a successful payment against its policy 1ms
 ✓ test/payment-handler.test.ts > payment handler > records a failed payment as failed 0ms
 × test/telemetry-contract.test.ts > telemetry contract > payment.recorded carries its required fields 4ms
   → payment.recorded is missing required fields: expected [ 'policyId' ] to deeply equal []
 ✓ test/telemetry-contract.test.ts > telemetry contract > payment.failed carries its required fields 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  test/telemetry-contract.test.ts > telemetry contract > payment.recorded carries its required fields
AssertionError: payment.recorded is missing required fields: expected [ 'policyId' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "policyId",
+ ]

 ❯ test/telemetry-contract.test.ts:42:66
     40|
     41|       const missing = fields.filter((field) => event?.[field] === unde…
     42|       expect(missing, `${eventType} is missing required fields`).toEqu…
       |                                                                  ^
     43|     });
     44|   }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 3 passed (4)
   Start at  18:37:10
   Duration  90ms (import 36%, transform 28%, tests 23%, worker 13%)
```

## Run 3: what the check misses

- Command: `npm test`
- Change: In `src/payment-handler.ts`, the `payment.recorded` event's line changed to `policyId: payment.paymentReference,`, so the field is present and holds the wrong identifier.
- Exit status: 0

```text

> ch01-required-event-fields@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch01-required-event-fields

 ✓ test/payment-handler.test.ts > payment handler > records a successful payment against its policy 1ms
 ✓ test/payment-handler.test.ts > payment handler > records a failed payment as failed 0ms
 ✓ test/telemetry-contract.test.ts > telemetry contract > payment.recorded carries its required fields 1ms
 ✓ test/telemetry-contract.test.ts > telemetry contract > payment.failed carries its required fields 0ms

 Test Files  2 passed (2)
      Tests  4 passed (4)
   Start at  18:37:10
   Duration  104ms (transform 71%, import 17%, tests 6%, worker 6%)
```
