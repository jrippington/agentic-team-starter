// Quoting's published quote result. Other modules, Documents among them, read
// these fields, so a change to them is a change to a contract.
export interface QuoteResult {
  quoteId: string;
  coverLevel: 'third party' | 'comprehensive';
  // The indicative annual premium in pounds, rounded to the penny.
  premiumAnnual: string;
  currency: 'GBP';
  // The last day the quote can be accepted, as an ISO 8601 date.
  validUntil: string;
}

export function getQuoteResult(quoteId: string): QuoteResult {
  return {
    quoteId,
    coverLevel: 'comprehensive',
    premiumAnnual: '412.33',
    currency: 'GBP',
    validUntil: '2026-12-10',
  };
}
