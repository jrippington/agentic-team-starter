# One implementation

A small pricing sample with an interface that has one implementation and a factory with one product, and tests that pass whether those are there or not. This exercise works the other way round from the rest: no check settles the question, and the tests show why. Whether an abstraction earns its place is a judgement, made in review.

## What is here

| File | What it holds |
|---|---|
| `src/pricing.ts` | `PricingStrategy`, an interface; `StandardPricingStrategy`, its only implementation; and `createPricingStrategy`, a factory with one product, motor insurance |
| `src/quote.ts` | `priceQuote`, which asks the factory for a strategy and prices the quote with it |
| `test/quote.test.ts` | Three tests of the premiums `priceQuote` returns |
| `observed/RUNS.md` | The runs this README describes, as recorded |

## What you need

Node.js 22 (22.12 or later) and npm.

## Run the tests

```sh
npm install
npm test
```

## What you should see

```text
 ✓ test/quote.test.ts > priceQuote > prices an experienced driver with two years of no claims 1ms
 ✓ test/quote.test.ts > priceQuote > adds a loading for a driver under 25 0ms
 ✓ test/quote.test.ts > priceQuote > counts no more than five years of no claims 0ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

## The change to make: remove the interface and the factory

1. Replace the whole of `src/pricing.ts` with:

   ```ts
   export interface QuoteDetails {
     coverBasePence: number;
     driverAge: number;
     noClaimsYears: number;
   }

   export function pricePremium(details: QuoteDetails): number {
     const youngDriverLoading = details.driverAge < 25 ? 30_000 : 0;
     const noClaimsDiscount = Math.min(details.noClaimsYears, 5) * 2_500;
     return details.coverBasePence + youngDriverLoading - noClaimsDiscount;
   }
   ```

2. Replace the whole of `src/quote.ts` with:

   ```ts
   import { pricePremium, type QuoteDetails } from './pricing.ts';

   export interface Quote {
     quoteId: string;
     premiumPence: number;
   }

   // Prices a motor insurance quote.
   export function priceQuote(quoteId: string, details: QuoteDetails): Quote {
     return { quoteId, premiumPence: pricePremium(details) };
   }
   ```

3. Run `npm test`.

## What the tests print

The same three tests pass, and `npm test` exits with status 0:

```text
 ✓ test/quote.test.ts > priceQuote > prices an experienced driver with two years of no claims 1ms
 ✓ test/quote.test.ts > priceQuote > adds a loading for a driver under 25 0ms
 ✓ test/quote.test.ts > priceQuote > counts no more than five years of no claims 0ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

They passed before the change and after it, as they should: they test the premium `priceQuote` returns, and that is right both times. They say nothing about whether the interface and the factory should exist. A tool can flag an interface with one implementation as a hint for a reviewer; it cannot decide.

Put the files back with `git restore src`.

## The questions a reviewer asks

1. Is there a second use now, not one imagined for later? Here there is one product, priced one way.
2. If it is a guard, which invariant or trust boundary does it protect? Any guard that protects neither is noise.
3. If it is a layer, what does it translate or protect? Any layer that does neither passes calls through, adds a step to every call, and hides the real one.

When a second implementation arrives, adding the interface takes minutes. Until then, the interface and the factory are code everyone has to read for nothing. Keep one where it is a real seam: where a test needs to put something in its place, or where it stands in front of an outside service.

## What the check does not catch

Everything in the section above. The tests check behaviour; the shape of the code is the reviewer's to judge.

## In the book

*Architecture for the Agentic Team*, Chapter 8.
