import { renderQuoteSummary } from '../../documents/index.ts';
import { priceQuote } from '../../policy/index.ts';

export interface Quote {
  quoteId: string;
  cover: 'third party' | 'comprehensive';
  coverBase: number;
  riskFactor: number;
}

// The quote summary shows the indicative annual premium, priced by Policy.
export function buildQuoteSummary(quote: Quote): string {
  const premiumAnnual = priceQuote({ coverBase: quote.coverBase, riskFactor: quote.riskFactor });
  return renderQuoteSummary({ quoteId: quote.quoteId, cover: quote.cover, premiumAnnual });
}
