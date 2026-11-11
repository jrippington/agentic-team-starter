export interface Quote {
  readonly id: string;
  readonly createdAt: Date;
  readonly premiumAnnual: number;
  readonly accepted: boolean;
}

// Find a quote by its identifier. A missing quote is an error for the caller.
export function findQuote(quotes: readonly Quote[], id: string): Quote {
  const quote = quotes.find((q) => q.id === id);
  if (!quote) throw new Error(`No quote ${id}`);
  return quote;
}
