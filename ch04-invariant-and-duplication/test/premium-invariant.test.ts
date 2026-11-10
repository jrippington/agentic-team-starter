import fc from 'fast-check';
import { expect, test } from 'vitest';
import { Money } from '../src/money.ts';
import { adjustPolicy, bindPolicy } from '../src/policy.ts';

// The premium invariant: for each policy, the amount Policy records as owed
// equals the premium at binding plus every adjustment made since, each
// counted exactly once.

// An unrounded premium between 100.0000 and 5000.0000, such as "412.3333".
const unroundedPremium = fc
  .integer({ min: 1_000_000, max: 50_000_000 })
  .map((n) => `${Math.floor(n / 10_000)}.${String(n % 10_000).padStart(4, '0')}`);

// Adjustments with distinct ids, each between a refund of 200.00 and an increase of 200.00.
const adjustments = fc.uniqueArray(
  fc.record({
    id: fc.integer({ min: 1, max: 999 }).map((n) => `ADJ-${n}`),
    pence: fc.integer({ min: -20_000, max: 20_000 }),
  }),
  { selector: (adjustment) => adjustment.id, maxLength: 8 },
);

// Positions of adjustments to deliver a second time.
const repeats = fc.array(fc.nat(), { maxLength: 4 });

test('amount owed equals the premium at binding plus every adjustment since, each counted once', () => {
  fc.assert(
    fc.property(unroundedPremium, adjustments, repeats, (premium, made, again) => {
      const deliveries =
        made.length === 0 ? [] : [...made, ...again.map((n) => made[n % made.length])];

      let policy = bindPolicy('POL-4001', premium);
      for (const { id, pence } of deliveries) {
        policy = adjustPolicy(policy, { id, amount: Money.fromPence(pence) });
      }

      const expected = made.reduce(
        (total, { pence }) => total.plus(Money.fromPence(pence)),
        policy.premiumAtBinding,
      );
      expect(policy.amountOwed.toString(), 'amount owed').toBe(expected.toString());
    }),
  );
});
