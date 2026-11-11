# Invariant and duplication

Two checks on a small policy record. A property-based test enforces the premium invariant: for each policy, the amount Policy records as owed equals the premium at binding plus every adjustment made since, each counted exactly once. A duplication check enforces the rule that the rounding rule has one home, in Money.

## What is here

| File | What it holds |
|---|---|
| `src/money.ts` | Money, an amount held as a whole number of pence, and `roundHalfEven`, the rounding rule. Half to even: 412.325 becomes 412.32, 412.335 becomes 412.34, and 412.3333 becomes 412.33 |
| `src/policy.ts` | The policy record. `bindPolicy` rounds the premium through Money; `adjustPolicy` records each adjustment once, however many times it is delivered |
| `test/money.test.ts`, `test/policy.test.ts` | Tests by example |
| `test/premium-invariant.test.ts` | The property-based test, written with fast-check. It generates premiums and adjustments, delivers some adjustments twice, and asserts the invariant sentence |
| `.jscpd.json` | The duplication check's settings: TypeScript files in `src/`, clones of 30 tokens or more, mild mode |
| `observed/RUNS.md` | The runs this README describes, as recorded |

## What you need

Node.js 22 (22.12 or later) and npm.

## Run the checks

```sh
npm install
npm test
npm run check
```

## What you should see

`npm test` runs ten tests, and they all pass. The last is the property:

```text
 ✓ test/premium-invariant.test.ts > amount owed equals the premium at binding plus every adjustment since, each counted once 6ms

 Test Files  3 passed (3)
      Tests  10 passed (10)
```

`npm run check` analyses the two files in `src/` and finds nothing:

```text
Using config from .jscpd.json
No duplicates found.
```

It then prints a table of what it analysed, ending `Found 0 clones.`

## Make the first bad change: a bug in the adjustment arithmetic

Someone rewrites `adjustPolicy` to work out the amount owed from the list of adjustments, and starts from the wrong figure.

1. Open `src/policy.ts`.
2. In `adjustPolicy`, replace this line:

   ```ts
       amountOwed: policy.amountOwed.plus(adjustment.amount),
   ```

   with this one:

   ```ts
       amountOwed: adjustments.reduce((total, each) => total.plus(each.amount), policy.amountOwed),
   ```

3. Run `npm test`.

## What the property-based test prints

The nine tests by example pass. Each makes at most one adjustment, and with one adjustment the new line gives the right answer. The property fails, and fast-check shrinks the failing case to the smallest it can find:

```text
 × test/premium-invariant.test.ts > amount owed equals the premium at binding plus every adjustment since, each counted once 10ms
   → Property failed after 1 tests
{ seed: 511481450, path: "0:0:1:0:2:1:1:1:1:1:1:1:1:1:3:2:2:2:2:2:2:2:2:2:2:2:2:2:2:3:4:4", endOnFailure: true }
Counterexample: ["100.0000",[{"id":"ADJ-2","pence":-1},{"id":"ADJ-1","pence":0}],[]]
Shrunk 31 time(s)
```

Further down, it gives the failed assertion:

```text
Caused by: AssertionError: amount owed: expected '99.98' to be '99.99' // Object.is equality
```

Read the counterexample in order: an unrounded premium of 100.0000; two adjustments, one of minus a penny and one of nothing; and no repeated deliveries. The invariant says the policy owes 99.99. Policy records 99.98, because the second adjustment counted the first one again. `npm test` exits with status 1.

Your seed will differ, and so may the details of the counterexample: plus a penny where this one has minus a penny, or the ids the other way round. Its shape will be the same, two adjustments with the first of one penny.

Undo the change with `git restore src/policy.ts`.

## Make the second bad change: copy the rounding rule

Payments needs the amount to collect. Instead of asking Policy, someone copies Money's rounding function, and changes one line to round half up, believing it to be the usual rule.

1. Create the file `src/amount-to-collect.ts` with this content:

   ```ts
   const DECIMAL = /^(-?)(\d+)(?:\.(\d+))?$/;

   // The amount to take from the customer, in pence.
   export function amountToCollect(amount: string): bigint {
     const parts = DECIMAL.exec(amount);
     if (parts === null) throw new Error(`Not a decimal amount: ${amount}`);
     const [, sign, whole, fraction = ''] = parts;
     const pence = BigInt(whole + fraction.padEnd(2, '0').slice(0, 2));
     const rest = fraction.slice(2).replace(/0+$/, '');
     const roundUp = rest >= '5';
     const rounded = roundUp ? pence + 1n : pence;
     return sign === '-' ? -rounded : rounded;
   }
   ```

2. Run `npm test`. All ten tests still pass: no test calls the copy.
3. Run `npm run check`.

Apart from its name and comment, the copy differs from `roundHalfEven` in one line, the one that decides whether to round up. The two agree on most amounts and part at an exact half. For 412.325, Money gives 412.32 and the copy gives 412.33, so Payments would collect a penny more than Policy records as owed.

## What the duplication check prints

```text
Clone found (typescript)
 - amount-to-collect.ts [4:32 - 10:23] (7 lines, 92 tokens)
   money.ts [39:30 - 45:23]
```

The table that follows counts one clone, and the last lines are:

```text
Found 1 clones.
```

`npm run check` exits with status 1. The clone ends at line 10 of the copy, where the changed line breaks the match.

Undo the change by deleting `src/amount-to-collect.ts`.

## What the checks do not catch

- Whether the property states the real invariant. Any property that makes only one adjustment per policy passes with the planted bug, and so does any that works out the expected amount with the same code it is testing. The owner of the business rule, reading the sentence and the generators, is the one who can tell.
- A rule rewritten by hand. The duplication check finds copied tokens, not copied meaning: `Math.round(Number(amount) * 100)` in Payments would be a second home for the rounding rule, and the check would not see it.
- A copy shorter than 30 tokens, or one changed in so many places that no run of 30 tokens survives.
- An aggregate drawn too large or too small. You find out when changes start waiting on each other, or when the data stops agreeing.

## In the book

*Architecture for the Agentic Team*, Chapter 4.
