import { createPricingStrategy, type QuoteDetails } from './pricing.ts';

export interface Quote {
  quoteId: string;
  premiumPence: number;
}

// Prices a motor insurance quote.
export function priceQuote(quoteId: string, details: QuoteDetails): Quote {
  const strategy = createPricingStrategy('motor');
  return { quoteId, premiumPence: strategy.price(details) };
}
