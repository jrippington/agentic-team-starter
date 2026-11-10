import { describe, expect, it } from 'vitest';
import { priceQuote } from '../src/quote.ts';

describe('priceQuote', () => {
  it('prices an experienced driver with two years of no claims', () => {
    const quote = priceQuote('QTE-3001', { coverBasePence: 46_233, driverAge: 40, noClaimsYears: 2 });
    expect(quote).toEqual({ quoteId: 'QTE-3001', premiumPence: 41_233 });
  });

  it('adds a loading for a driver under 25', () => {
    const quote = priceQuote('QTE-3002', { coverBasePence: 46_233, driverAge: 22, noClaimsYears: 0 });
    expect(quote.premiumPence).toBe(76_233);
  });

  it('counts no more than five years of no claims', () => {
    const five = priceQuote('QTE-3003', { coverBasePence: 46_233, driverAge: 40, noClaimsYears: 5 });
    const nine = priceQuote('QTE-3004', { coverBasePence: 46_233, driverAge: 40, noClaimsYears: 9 });
    expect(nine.premiumPence).toBe(five.premiumPence);
  });
});
