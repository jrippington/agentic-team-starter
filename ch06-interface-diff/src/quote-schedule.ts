import type { QuoteResult } from './quote-result.ts';

// A consumer of the quote result: Documents' quote schedule. The template
// names the fields it reads as text, so no compiler checks that they still
// exist, and any field that has gone prints as a blank.
const template = ['Quote {quoteId}', 'Cover: {coverLevel}', 'Annual premium: £{premiumAnnual}'].join('\n');

export function renderQuoteSchedule(result: QuoteResult): string {
  const fields: Record<string, unknown> = { ...result };
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(fields[name] ?? ''));
}
