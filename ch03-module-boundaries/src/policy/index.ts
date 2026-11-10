// Policy's published interface. Other modules import from this file only.
import { calculatePremium, type PremiumRequest } from './internal/premium-calculator.ts';
import { roundToPence } from './internal/rounding.ts';

export type { PremiumRequest };

// Prices a quote: the premium Policy would bind, rounded to the penny.
export function priceQuote(request: PremiumRequest): number {
  return roundToPence(calculatePremium(request));
}
