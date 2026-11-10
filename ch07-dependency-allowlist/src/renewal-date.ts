// Formats the renewal date on a policy notice: "2026-12-10" becomes
// "10 December 2026". Node's built-in Intl.DateTimeFormat does the work.
const longDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatRenewalDate(isoDate: string): string {
  return longDate.format(new Date(`${isoDate}T00:00:00Z`));
}
