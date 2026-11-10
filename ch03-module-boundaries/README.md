# Module boundaries

Three modules, each with one published file, and the structural rule that holds the boundaries between them: a module may import another module only through that module's `index.ts`, and no chain of imports may lead back to where it started. dependency-cruiser checks the rule.

## What is here

| Path | What it holds |
|---|---|
| `src/quoting/` | Builds the quote summary. `index.ts` is its published interface; `internal/summary-builder.ts` does the work |
| `src/policy/` | Prices a quote. `index.ts` publishes `priceQuote`, which rounds the premium to the penny; `internal/premium-calculator.ts` returns the premium before rounding |
| `src/documents/` | Renders the quote summary. `index.ts` publishes `renderQuoteSummary` |
| `.dependency-cruiser.mjs` | The rule, in two parts: `no-reach-in` and `no-cycles` |
| `observed/RUNS.md` | The runs this README describes, as recorded |

Quoting uses Policy and Documents, through their `index.ts` files. Policy and Documents use no other module.

## What you need

Node.js 22 (22.12 or later) and npm.

## Run the check

```sh
npm install
npm run check
```

## What you should see

```text
✔ no dependency violations found (7 modules, 6 dependencies cruised)
```

## Make the first bad change: reach in

The task is to show the indicative annual premium on the quote summary. The shortcut is to call Policy's internal calculator directly.

1. Open `src/quoting/internal/summary-builder.ts`.
2. Replace this line:

   ```ts
   import { priceQuote } from '../../policy/index.ts';
   ```

   with this one:

   ```ts
   import { calculatePremium } from '../../policy/internal/premium-calculator.ts';
   ```

3. In `buildQuoteSummary`, change `priceQuote(` to `calculatePremium(`.
4. Run `npm run check`.

The code still compiles, and the summary still shows a premium. It is the wrong one: the figure before Policy's rounding, not the premium Policy would bind.

## What the check prints

The check names the rule, the importing file and the internal file it reached into, and exits with status 1:

```text
  error no-reach-in: src/quoting/internal/summary-builder.ts → src/policy/internal/premium-calculator.ts
    A module may import another module only through that module's index.ts, its
    published interface.


x 1 dependency violations (1 errors, 0 warnings). 7 modules, 6 dependencies cruised.
```

Undo the change with `git restore src/quoting/internal/summary-builder.ts` and run the check again. It passes: the same task, done through Policy's published interface.

## Make the second bad change: a cycle

1. Open `src/policy/index.ts`.
2. Below the two existing imports, add:

   ```ts
   import { buildQuoteSummary, type Quote } from '../quoting/index.ts';
   ```

3. At the end of the file, add:

   ```ts
   // The welcome letter repeats the quote summary the customer accepted.
   export function welcomeLetter(quote: Quote): string {
     return `Welcome to your policy.\n\n${buildQuoteSummary(quote)}`;
   }
   ```

4. Run `npm run check`.

Every import still goes through an `index.ts`, so `no-reach-in` has nothing to report. But Policy now depends on Quoting, which depends on Policy.

## What the check prints

The check prints the whole cycle and exits with status 1:

```text
  error no-cycles: src/policy/index.ts → 
      src/quoting/index.ts →
      src/quoting/internal/summary-builder.ts →
      src/policy/index.ts
    No chain of imports may lead from a file back to itself.


x 1 dependency violations (1 errors, 0 warnings). 7 modules, 7 dependencies cruised.
```

Undo the change with `git restore src/policy/index.ts`.

## What the check does not catch

- Whether a boundary is in the right place. The rule holds the boundaries you drew; a design review by someone who knows the domain decides whether they are drawn well.
- Which module may depend on which. This rule checks how one module imports another, not whether it may: Policy importing Documents through its `index.ts` would pass, because it makes no cycle. A complete boundary rule also lists, for each module, the modules it may use. Here, Policy should use neither of the others.
- Whether two things belong together. No tool knows that two pieces of code change together; a change history is a hint to look, not a check.
- The same dependency made another way: by copying the internal code instead of importing it, by reading another module's tables in the database, or by loading a module by name while the program runs.
- A published interface that hands out internals under another name.

## In the book

*Architecture for the Agentic Team*, Chapter 3.
