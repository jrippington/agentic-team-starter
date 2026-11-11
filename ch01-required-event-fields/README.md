# Required event fields

A payment handler records a payment and emits an event about it. This exercise shows a test that enforces the rule "every event of a named type carries the fields listed for it", and a change that breaks the rule while every functional test still passes.

## What is here

| File | What it holds |
|---|---|
| `src/payment-handler.ts` | The handler. It records the payment a provider's notification describes and emits a `payment.recorded` or `payment.failed` event |
| `src/events.ts` | Where events go: standard output, or a recording sink that a test can read |
| `required-event-fields.json` | The list the rule refers to: for each event type, the fields it must carry |
| `test/payment-handler.test.ts` | Functional tests: is the payment recorded correctly? |
| `test/telemetry-contract.test.ts` | The check. For each event type in the list, it sends a notification through the real handler and looks for every required field |
| `observed/RUNS.md` | The runs this README describes, as recorded |

## What you need

Node.js 22 (22.12 or later) and npm.

## Run the check

```sh
npm install
npm test
```

## What you should see

Four tests pass: two functional tests, and one contract test for each event type.

```text
 ✓ test/telemetry-contract.test.ts > telemetry contract > payment.recorded carries its required fields 1ms
 ✓ test/telemetry-contract.test.ts > telemetry contract > payment.failed carries its required fields 0ms
 ✓ test/payment-handler.test.ts > payment handler > records a successful payment against its policy 1ms
 ✓ test/payment-handler.test.ts > payment handler > records a failed payment as failed 0ms

 Test Files  2 passed (2)
      Tests  4 passed (4)
```

The order of the lines can change from run to run.

## Make the bad change

1. Open `src/payment-handler.ts`.
2. In the `payment.recorded` event (the first `events.emit` call), delete this line:

   ```ts
         policyId: payment.policyId,
   ```

3. Run `npm test`.

## What the check prints

The functional tests still pass: the payment is recorded correctly. The contract test fails, naming the event type and the missing field, and `npm test` exits with status 1:

```text
 × test/telemetry-contract.test.ts > telemetry contract > payment.recorded carries its required fields 4ms
   → payment.recorded is missing required fields: expected [ 'policyId' ] to deeply equal []
```

Without the policy identifier, whoever reads the log when a payment goes wrong cannot tell which policy it was for. No functional test asks about that, which is why the rule needs a check of its own.

Put the line back with `git restore src/payment-handler.ts`.

## What the check does not catch

The check looks for each field; it does not look at what the field holds. Any field that is present and useless passes, whether it is empty or holds the wrong identifier. To see this:

1. In the `payment.recorded` event, change the line `policyId: payment.policyId,` to:

   ```ts
         policyId: payment.paymentReference,
   ```

2. Run `npm test`. All four tests pass, although every `payment.recorded` event now carries the payment's own reference where the policy should be.
3. Run `git restore src/payment-handler.ts`.

The check also misses any event type that is not in `required-event-fields.json`, and any code path that emits an event but that the test's two notifications do not reach. Review covers these: whoever reviews a change that adds or alters an event type checks the list and the values, and someone traces one real payment from start to finish from time to time.

## In the book

*Architecture for the Agentic Team*, Chapter 1.
