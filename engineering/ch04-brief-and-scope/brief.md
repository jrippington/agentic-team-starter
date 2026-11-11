# Q-12. A quote's summary shows the last day it can be accepted

| Header | |
|---|---|
| Work identifier | Q-12 |
| Owner | The owner of Quoting |
| Brief revision | 1 |
| Permitted execution profile | Maintenance |

## Intent

A customer reading a quote's summary can see the last day on which they can accept it, so that nobody is surprised when a quote more than 30 days old is refused.

## Scope and out-of-bounds

In scope:
- `src/quoting/`
- `test/quoting/`

Out of bounds:
- `src/policy/`: pricing and money belong to Policy
- `test/support/`: the shared test helpers, which every module's tests use

Recovery procedure: the change is one commit with no data change; revert it.

## Context sources

- `src/quoting/quote.ts`: the quote and the number of days it is valid
- `src/quoting/summary.ts`: the summary to change

## Acceptance evidence

| Case | Evidence |
|---|---|
| Must pass: a quote created on 2 March 2026 shows "valid until 2026-04-01" | The test in `test/quoting/summary.test.ts` |
| Must not break: the premium is shown in pounds, as now | The same test |
| The change stays inside this brief | `npm run check` |
