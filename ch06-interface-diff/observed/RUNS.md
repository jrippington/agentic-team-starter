# Observed runs

The runs described in this exercise's README, as they were recorded.

| | |
|---|---|
| Date | 10 November 2026 |
| Operating system | Darwin 27.0.0 (from `uname -sr`) |
| Node.js | v22.23.1, with npm 10.9.8 |
| Tools | The interface diff in `checks/interface-diff.ts`, on the TypeScript 6.0.3 compiler API, run by tsx 4.23.15 |

Each run names the change made to the exercise, as it is in the repository, before the command ran. The output is copied exactly, with two edits: ANSI colour codes are removed, and the absolute path of the repository on the recording machine is shown as `<repository>`. Timings and start times differ from run to run.

## Run 1: the starting state

- Command: `npm run check`
- Change: None.
- Exit status: 0

```text

> ch06-interface-diff@1.0.0 check
> tsx checks/interface-diff.ts

Interface diff: src/quote-result.ts against snapshot/quote-result.json

Passed: the published interface matches the snapshot.
```

## Run 2: after the rename

- Command: `npm run check`
- Change: In `src/quote-result.ts`, `premiumAnnual` renamed `annualPremium` in the interface and in `getQuoteResult`.
- Exit status: 1

```text

> ch06-interface-diff@1.0.0 check
> tsx checks/interface-diff.ts

Interface diff: src/quote-result.ts against snapshot/quote-result.json
  removed  QuoteResult.premiumAnnual: string
  added    QuoteResult.annualPremium: string

Failed: 1 removed and 0 changed. A consumer may still depend on them.
A rename is a removal and an addition. Add the new name beside the old one, move each
consumer to the new name, and remove the old one in a later release.
```

## Run 3: expand: the new name beside the old

- Command: `npm run check`
- Change: The rename undone. In `src/quote-result.ts`, `annualPremium` added beside `premiumAnnual`, in the interface and in `getQuoteResult`.
- Exit status: 0

```text

> ch06-interface-diff@1.0.0 check
> tsx checks/interface-diff.ts

Interface diff: src/quote-result.ts against snapshot/quote-result.json
  added    QuoteResult.annualPremium: string

Passed: 1 added, nothing removed or changed.
```

## Run 4: release the expanded interface

- Command: `npm run snapshot`
- Change: As run 3. The command records the expanded interface as the new snapshot.
- Exit status: 0

```text

> ch06-interface-diff@1.0.0 snapshot
> tsx checks/interface-diff.ts --update

Recorded 8 entries from src/quote-result.ts in snapshot/quote-result.json.
```

## Run 5: move the consumer

- Command: `npm run check`
- Change: As run 4, and in `src/quote-schedule.ts` the template changed from `{premiumAnnual}` to `{annualPremium}`.
- Exit status: 0

```text

> ch06-interface-diff@1.0.0 check
> tsx checks/interface-diff.ts

Interface diff: src/quote-result.ts against snapshot/quote-result.json

Passed: the published interface matches the snapshot.
```

## Run 6: contract: remove the old name

- Command: `npm run check`
- Change: As run 5, and `premiumAnnual` removed from the interface and from `getQuoteResult`.
- Exit status: 1

```text

> ch06-interface-diff@1.0.0 check
> tsx checks/interface-diff.ts

Interface diff: src/quote-result.ts against snapshot/quote-result.json
  removed  QuoteResult.premiumAnnual: string

Failed: 1 removed and 0 changed. A consumer may still depend on them.
```

## Run 7: contract, approved

- Command: `npm run snapshot && npm run check`
- Change: As run 6. The command records the snapshot again, then runs the check.
- Exit status: 0

```text

> ch06-interface-diff@1.0.0 snapshot
> tsx checks/interface-diff.ts --update

Recorded 7 entries from src/quote-result.ts in snapshot/quote-result.json.

> ch06-interface-diff@1.0.0 check
> tsx checks/interface-diff.ts

Interface diff: src/quote-result.ts against snapshot/quote-result.json

Passed: the published interface matches the snapshot.
```
