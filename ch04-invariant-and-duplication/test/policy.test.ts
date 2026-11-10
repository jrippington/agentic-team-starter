import { describe, expect, it } from 'vitest';
import { Money } from '../src/money.ts';
import { adjustPolicy, bindPolicy } from '../src/policy.ts';

describe('policy record', () => {
  it('owes the premium at binding, rounded by Money', () => {
    const policy = bindPolicy('POL-4001', '412.325');
    expect(policy.amountOwed.toString()).toBe('412.32');
  });

  it('adds an adjustment to what the policy owes', () => {
    const policy = adjustPolicy(bindPolicy('POL-4001', '412.325'), {
      id: 'ADJ-1',
      amount: Money.fromPence(2500),
    });
    expect(policy.amountOwed.toString()).toBe('437.32');
  });

  it('counts an adjustment delivered twice once', () => {
    const adjustment = { id: 'ADJ-1', amount: Money.fromPence(2500) };
    const once = adjustPolicy(bindPolicy('POL-4001', '412.325'), adjustment);
    const twice = adjustPolicy(once, adjustment);
    expect(twice.amountOwed.toString()).toBe('437.32');
  });
});
