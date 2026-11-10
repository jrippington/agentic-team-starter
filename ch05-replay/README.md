# Replay

A handler for the payment provider's notifications, on a real PostgreSQL database, and a replay test that delivers the same notification twice. The rule: a payment notification is applied at most once, however many times it is delivered. The provider's notification identifier is the idempotency key, and the handler records it in the same transaction as the payment.

## What is here

| File | What it holds |
|---|---|
| `src/schema.sql` | Two tables: `payments`, and `handled_notifications`, whose primary key is the provider's notification identifier |
| `src/db.ts` | Opens a new database in memory, with the schema applied |
| `src/notification-handler.ts` | The handler |
| `test/replay.test.ts` | Three tests. The same notification delivered twice gives one payment; two different notifications give two; a notification whose payment is not recorded is not marked as handled |
| `observed/RUNS.md` | The runs this README describes, as recorded |

The database is PGlite, PostgreSQL compiled to WebAssembly, which runs inside Node with no server to install. Each test opens its own database in memory, which takes about half a second.

## What you need

Node.js 22 (22.12 or later) and npm.

## Run the check

```sh
npm install
npm test
```

## What you should see

```text
 ✓ test/replay.test.ts > payment notification handler > records one payment when the same notification is delivered twice 705ms
 ✓ test/replay.test.ts > payment notification handler > records a payment for each different notification 495ms
 ✓ test/replay.test.ts > payment notification handler > does not mark a notification as handled when its payment is not recorded 483ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

## Make the bad change

A first version of a handler often records a payment on every call. The provider delivers the same notification twice, as its documentation says it may.

1. Open `src/notification-handler.ts`.
2. Replace the body of `handleNotification`, from `return db.transaction(async (tx) => {` to the matching `});`, with:

   ```ts
     await db.query(
       `INSERT INTO payments (payment_reference, policy_id, amount_pence, status)
        VALUES ($1, $2, $3, $4)`,
       [notification.paymentReference, notification.policyId, notification.amountPence, notification.outcome],
     );
     return 'applied';
   ```

3. Run `npm test`.

## What the check prints

The other two tests pass. The replay test fails with two payments where there should be one, and `npm test` exits with status 1:

```text
 × test/replay.test.ts > payment notification handler > records one payment when the same notification is delivered twice 687ms
   → payments recorded: expected 2 to be 1 // Object.is equality
```

The provider took the money once; the ledger says it was paid twice.

## Fix it: the key and its record in one transaction

Run `git restore src/notification-handler.ts` to put back the handler as it is in the repository, or write it yourself from this description. It does three things, inside one transaction:

1. It inserts the notification identifier into `handled_notifications`. With `ON CONFLICT (notification_id) DO NOTHING RETURNING notification_id`, the insert returns a row only if the identifier is new.
2. If no row comes back, the notification has been handled before. The handler returns `'duplicate'` and records nothing.
3. Otherwise it records the payment. Both rows are written in the same transaction, so either both are kept or neither is.

Run `npm test`. All three tests pass.

## Try the half fix

Recording the key outside a transaction looks almost the same, and the replay test cannot tell the difference.

1. Replace the body of `handleNotification` again, this time with:

   ```ts
     const claimed = await db.query(
       `INSERT INTO handled_notifications (notification_id) VALUES ($1)
        ON CONFLICT (notification_id) DO NOTHING
        RETURNING notification_id`,
       [notification.notificationId],
     );
     if (claimed.rows.length === 0) return 'duplicate';

     await db.query(
       `INSERT INTO payments (payment_reference, policy_id, amount_pence, status)
        VALUES ($1, $2, $3, $4)`,
       [notification.paymentReference, notification.policyId, notification.amountPence, notification.outcome],
     );
     return 'applied';
   ```

2. Run `npm test`.

The replay test passes. The third test fails:

```text
 × test/replay.test.ts > payment notification handler > does not mark a notification as handled when its payment is not recorded 486ms
   → notifications marked as handled: expected 1 to be +0 // Object.is equality
```

In that test the database refuses the payment, because an amount of zero breaks a `CHECK` constraint on `payments`. The refusal stands in for any failure between the two writes. Without a transaction, the notification stays marked as handled although its payment was never recorded, so when the provider delivers it again the handler skips it, and the payment is lost.

Run `git restore src/notification-handler.ts` to finish.

## What the check does not catch

- Order. A "failed" notice that arrives after the "succeeded" notice for the same payment is a different notification, with its own identifier, so this handler records both. Which one wins is a separate rule, and it needs an ordering test of its own.
- Two deliveries at the same moment. PGlite gives the tests one connection, so they deliver one notification after another. The primary key on `handled_notifications` still lets only one of two simultaneous inserts succeed, but showing that needs a test with two connections to a full PostgreSQL server, with the order of the steps under the test's control.
- The choice of key. A key taken from the wrong field would pass all three tests: the payment reference, say, when one payment can have several notifications. Whether the provider's notification identifier really is the same on every delivery is a question for the provider's documentation, not for a test.
- More generally, a clean run is weak evidence. The tests run the deliveries someone thought of. Whoever reviews a change to an entry point like this one checks it against the rules for repeated and late arrivals.

## In the book

*Architecture for the Agentic Team*, Chapter 5.
