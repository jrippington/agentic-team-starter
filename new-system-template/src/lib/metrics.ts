// Counts of calls on the paths that have a budget. A test resets the counts,
// runs a path and compares them with checks/budgets.json.
const calls = new Map<string, number>();

export function countCall(name: string): void {
  calls.set(name, (calls.get(name) ?? 0) + 1);
}

export function readCounts(): Record<string, number> {
  return Object.fromEntries(calls);
}

export function resetCounts(): void {
  calls.clear();
}
