import { roundHalfEven } from './money.ts';

// The annual premium: the base rate for the risk band, times the sum insured
// in thousands, less any loyalty discount, rounded to whole pence.
export function premiumAnnual(baseRate: number, sumInsured: number, loyaltyDiscount: number): number {
  const pence = baseRate * (sumInsured / 1000) * 100 * (1 - loyaltyDiscount);
  return roundHalfEven(pence) / 100;
}
