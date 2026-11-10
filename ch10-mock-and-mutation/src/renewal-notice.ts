import type { PremiumRepository } from './premium-repository.ts';

// The line of the renewal notice that tells the customer what they pay now.
export async function renewalNotice(repository: PremiumRepository, policyId: string): Promise<string> {
  const premiumPence = await repository.findCurrentPremium(policyId);
  if (premiumPence === null) {
    throw new Error(`No premium is recorded for ${policyId}`);
  }
  return `Policy ${policyId}: your current annual premium is £${(premiumPence / 100).toFixed(2)}.`;
}
