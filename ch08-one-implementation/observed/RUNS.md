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

> ch08-one-implementation@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch08-one-implementation

 ✓ test/quote.test.ts > priceQuote > prices an experienced driver with two years of no claims 1ms
 ✓ test/quote.test.ts > priceQuote > adds a loading for a driver under 25 0ms
 ✓ test/quote.test.ts > priceQuote > counts no more than five years of no claims 0ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  18:38:46
   Duration  89ms (import 44%, transform 29%, worker 15%, tests 12%)
```

## Run 2: after removing the interface and the factory

- Command: `npm test`
- Change: In `src/pricing.ts`, `PricingStrategy`, `StandardPricingStrategy` and `createPricingStrategy` replaced by one function, `pricePremium`; in `src/quote.ts`, `priceQuote` changed to call it.
- Exit status: 0

```text

> ch08-one-implementation@1.0.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 <repository>/ch08-one-implementation

 ✓ test/quote.test.ts > priceQuote > prices an experienced driver with two years of no claims 1ms
 ✓ test/quote.test.ts > priceQuote > adds a loading for a driver under 25 0ms
 ✓ test/quote.test.ts > priceQuote > counts no more than five years of no claims 0ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  18:38:46
   Duration  79ms (import 42%, transform 30%, tests 15%, worker 13%, environment 1%)
```
