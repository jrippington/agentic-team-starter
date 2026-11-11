// A clock fixed at one moment, for tests.
export const fixedClock = (iso: string) => () => new Date(iso);
