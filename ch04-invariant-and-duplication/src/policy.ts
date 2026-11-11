import { Money } from './money.ts';

export interface Adjustment {
  id: string;
  // Positive for an increase in premium, negative for a refund.
  amount: Money;
}

export interface PolicyRecord {
  policyId: string;
  premiumAtBinding: Money;
  adjustments: readonly Adjustment[];
  amountOwed: Money;
}

// Binds a policy at its premium, rounded to the penny by Money.
export function bindPolicy(policyId: string, unroundedPremium: string): PolicyRecord {
  const premiumAtBinding = Money.round(unroundedPremium);
  return { policyId, premiumAtBinding, adjustments: [], amountOwed: premiumAtBinding };
}

// Records an adjustment and what the policy now owes. Any adjustment that is
// already recorded, delivered again with the same id, changes nothing.
export function adjustPolicy(policy: PolicyRecord, adjustment: Adjustment): PolicyRecord {
  if (policy.adjustments.some((recorded) => recorded.id === adjustment.id)) {
    return policy;
  }
  const adjustments = [...policy.adjustments, adjustment];
  return {
    ...policy,
    adjustments,
    amountOwed: policy.amountOwed.plus(adjustment.amount),
  };
}
