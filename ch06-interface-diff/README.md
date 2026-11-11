# Interface diff

Quoting publishes a quote result that other modules read, Documents among them. This exercise compares the published type with a snapshot of it taken at the last release. The rule: a published interface changes only by addition. The diff accepts any added field and refuses any removed, renamed, or retyped one. Then the exercise makes the same rename safely, by expand and contract.

## What is here

| File | What it holds |
|---|---|
| `src/quote-result.ts` | The published interface: the `QuoteResult` type and `getQuoteResult` |
| `src/quote-schedule.ts` | A consumer: Documents' quote schedule, whose template names the fields it reads as text |
| `snapshot/quote-result.json` | The published interface at the last release: each exported name, and each member of each exported type, with its type |
| `checks/interface-diff.ts` | The check, a short program on the TypeScript compiler API |
| `observed/RUNS.md` | The runs this README describes, as recorded |

The two versions of the published schema are the snapshot, which is the last release, and `src/quote-result.ts`, which is the change.

## What you need

Node.js 22 (22.12 or later) and npm.

## Run the check

```sh
npm install
npm run check
```

## What you should see

```text
Interface diff: src/quote-result.ts against snapshot/quote-result.json

Passed: the published interface matches the snapshot.
```

## Make the bad change: rename a field

For consistency with other names, someone renames `premiumAnnual` to `annualPremium`.

1. Open `src/quote-result.ts`.
2. Rename `premiumAnnual` to `annualPremium` in both places: in the interface and in `getQuoteResult`.
3. Run `npm run check`.

Everything still compiles, the consumer included: its template names the field as text, so no compiler sees that the field has gone. The next quote schedule would print a blank where the annual premium should be.

## What the check prints

The check names the field that went and the one that arrived, and exits with status 1:

```text
Interface diff: src/quote-result.ts against snapshot/quote-result.json
  removed  QuoteResult.premiumAnnual: string
  added    QuoteResult.annualPremium: string

Failed: 1 removed and 0 changed. A consumer may still depend on them.
A rename is a removal and an addition. Add the new name beside the old one, move each
consumer to the new name, and remove the old one in a later release.
```

Undo the change with `git restore src/quote-result.ts`.

## Make the change safely: expand and contract

The same rename, as three steps. After each one, every consumer still works.

### 1. Expand: add the new name beside the old one

1. In `src/quote-result.ts`, add these two lines to the interface, directly below `premiumAnnual: string;`:

   ```ts
     // The same figure under its new name. Consumers move to this one.
     annualPremium: string;
   ```

2. In `getQuoteResult`, add this line directly below `premiumAnnual: '412.33',`:

   ```ts
       annualPremium: '412.33',
   ```

3. Run `npm run check`. The addition passes:

   ```text
   Interface diff: src/quote-result.ts against snapshot/quote-result.json
     added    QuoteResult.annualPremium: string

   Passed: 1 added, nothing removed or changed.
   ```

4. Release it. Recording the snapshot is part of the release:

   ```sh
   npm run snapshot
   ```

   ```text
   Recorded 8 entries from src/quote-result.ts in snapshot/quote-result.json.
   ```

### 2. Move each consumer

1. In `src/quote-schedule.ts`, change `{premiumAnnual}` to `{annualPremium}` in the template.
2. Run `npm run check`. It passes, because the published interface has not changed:

   ```text
   Passed: the published interface matches the snapshot.
   ```

In a real system this step is one change for each consumer, made by or with that consumer's owner. It is finished only when you know that every consumer has moved.

### 3. Contract: remove the old name, in a later release

1. In `src/quote-result.ts`, delete these two lines from the interface, so that the comment about the indicative annual premium sits directly above `annualPremium`:

   ```ts
     premiumAnnual: string;
     // The same figure under its new name. Consumers move to this one.
   ```

2. In `getQuoteResult`, delete the line `premiumAnnual: '412.33',`.
3. Run `npm run check`. The check fails, as it should:

   ```text
   Interface diff: src/quote-result.ts against snapshot/quote-result.json
     removed  QuoteResult.premiumAnnual: string

   Failed: 1 removed and 0 changed. A consumer may still depend on them.
   ```

A removal breaks any consumer that still reads the field, whatever its history. The check cannot know that every consumer has moved; the owner of the interface can, and approves the removal. The approval is recorded by taking a new snapshot in the same change, so that a reviewer sees the snapshot change beside the removal:

```sh
npm run snapshot && npm run check
```

```text
Recorded 7 entries from src/quote-result.ts in snapshot/quote-result.json.
```

```text
Passed: the published interface matches the snapshot.
```

To put the exercise back as it started, run `git restore src snapshot`.

## What the check does not catch

- A change that is valid against the type and wrong in meaning. If `premiumAnnual` kept its name and its type and started holding the monthly figure, the diff would pass. The interface's owner approves every change to a published interface, and the owner of each consumer reviews what the change means for them.
- A consumer nobody knew about, such as one outside the repository. The diff protects whoever still reads a field; knowing who reads it is the job of the list of consumers, kept by the interface's owner.
- The consumer's side. A consumer test, in which Documents writes down what it reads from the quote result and Quoting runs those expectations against its real output, checks what this diff cannot.
- The snapshot itself. Running `npm run snapshot` in the same change as a removal makes the check pass. That is how an approved removal goes through, and also how an unapproved one would. A reviewer has to notice the change to `snapshot/`.
- Function signatures in detail. They are compared as text, so even a harmless change to `getQuoteResult`, such as a new optional parameter, fails the diff.

## In the book

*Architecture for the Agentic Team*, Chapter 6.
