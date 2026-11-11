import type { Quote } from './quote.ts';

// The one-line summary shown beside a quote.
export function summarise(quote: Quote): string {
  return `Quote ${quote.id}: £${(quote.premiumPence / 100).toFixed(2)} a year`;
}
