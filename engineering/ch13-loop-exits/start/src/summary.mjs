// The one-line summary shown beside a quote.
export function summarise(quote) {
  return `Quote ${quote.id}: £${(quote.premiumPence / 100).toFixed(2)} a year`;
}
