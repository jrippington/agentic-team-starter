// A quote stays fresh for 30 days from the moment it was created. After that
// it is stale: its rates may have changed, so it cannot be accepted.
export const FRESH_FOR_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export function isStale(createdAt: Date, now: Date): boolean {
  return now.getTime() - createdAt.getTime() > FRESH_FOR_DAYS * DAY_MS;
}
