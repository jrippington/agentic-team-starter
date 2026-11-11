import type { Policy } from '../policy/bind.ts';

// The policy schedule sent to the customer once a policy is bound.
export function schedule(policy: Policy): string {
  return [`Policy ${policy.number}`, `Annual premium: £${policy.premiumAnnual.toFixed(2)}`].join('\n');
}
