import type { Quote } from './quote.ts';

// The line shown beside a quote in the customer's account.
export function summarise(quote: Quote): string {
  const status = quote.accepted ? 'accepted' : 'open';
  return `Quote ${quote.id} (${status}): £${quote.premiumAnnual.toFixed(2)} a year`;
}
