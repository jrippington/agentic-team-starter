export interface PremiumRequest {
  coverBase: number;
  riskFactor: number;
}

// The premium before rounding. Policy rounds it once, in its published priceQuote.
export function calculatePremium(request: PremiumRequest): number {
  return request.coverBase * request.riskFactor;
}
