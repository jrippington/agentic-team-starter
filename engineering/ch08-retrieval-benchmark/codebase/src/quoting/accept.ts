import { bindPolicy } from '../policy/bind.ts';
import { isStale } from './freshness.ts';
import type { Quote } from './quote.ts';

export class QuoteNoLongerFresh extends Error {}

// Accepting a quote binds a policy at the quoted premium, unless the quote has
// gone stale, in which case the customer is turned away and nothing is bound.
export function acceptQuote(quote: Quote, now: Date) {
  if (isStale(quote.createdAt, now)) throw new QuoteNoLongerFresh(quote.id);
  return bindPolicy(quote.id, quote.premiumAnnual);
}
