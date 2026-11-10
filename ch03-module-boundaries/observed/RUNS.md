# Observed runs

The runs described in this exercise's README, as they were recorded.

| | |
|---|---|
| Date | 10 November 2026 |
| Operating system | Darwin 27.0.0 (from `uname -sr`) |
| Node.js | v22.23.1, with npm 10.9.8 |
| Tools | dependency-cruiser 18.7.2 and TypeScript 6.0.3 |

Each run names the change made to the exercise, as it is in the repository, before the command ran. The output is copied exactly, with two edits: ANSI colour codes are removed, and the absolute path of the repository on the recording machine is shown as `<repository>`. Timings and start times differ from run to run.

## Run 1: the starting state

- Command: `npm run check`
- Change: None.
- Exit status: 0

```text

> ch03-module-boundaries@1.0.0 check
> depcruise src --output-type err-long


✔ no dependency violations found (7 modules, 6 dependencies cruised)
```

## Run 2: after the reach-in

- Command: `npm run check`
- Change: In `src/quoting/internal/summary-builder.ts`, `priceQuote` imported from `../../policy/index.ts` replaced by `calculatePremium` imported from `../../policy/internal/premium-calculator.ts`, and the call changed to match.
- Exit status: 1

```text

> ch03-module-boundaries@1.0.0 check
> depcruise src --output-type err-long


  error no-reach-in: src/quoting/internal/summary-builder.ts → src/policy/internal/premium-calculator.ts
    A module may import another module only through that module's index.ts, its
    published interface.


x 1 dependency violations (1 errors, 0 warnings). 7 modules, 6 dependencies cruised.
```

## Run 3: after the cycle

- Command: `npm run check`
- Change: The reach-in undone. In `src/policy/index.ts`, an import of `buildQuoteSummary` and `Quote` from `../quoting/index.ts` added, with the function `welcomeLetter` that uses them.
- Exit status: 1

```text

> ch03-module-boundaries@1.0.0 check
> depcruise src --output-type err-long


  error no-cycles: src/policy/index.ts → 
      src/quoting/index.ts →
      src/quoting/internal/summary-builder.ts →
      src/policy/index.ts
    No chain of imports may lead from a file back to itself.


x 1 dependency violations (1 errors, 0 warnings). 7 modules, 7 dependencies cruised.
```
