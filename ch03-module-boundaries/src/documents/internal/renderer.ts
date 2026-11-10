export interface QuoteSummary {
  quoteId: string;
  cover: string;
  premiumAnnual: number;
}

export function renderQuoteSummary(summary: QuoteSummary): string {
  return [
    `Quote ${summary.quoteId}`,
    `Cover: ${summary.cover}`,
    `Indicative annual premium: £${summary.premiumAnnual}`,
  ].join('\n');
}
