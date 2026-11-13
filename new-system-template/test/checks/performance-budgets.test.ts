// The performance-budgets check. For each path in checks/budgets.json, it runs
// the path, counts its calls and compares each count with the budget. A
// budget for a path this file cannot run fails, so that no budget goes
// untested.
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createContactsModule } from '../../src/contacts/index.ts';
import { useEventSink } from '../../src/lib/events.ts';
import { readCounts, resetCounts } from '../../src/lib/metrics.ts';

const budgets: { paths: Record<string, { calls?: Record<string, number> }> } = JSON.parse(
  readFileSync(new URL('../../checks/budgets.json', import.meta.url), 'utf8'),
);

// The paths a budget may name, and the code each runs. Add each new path here.
const paths: Record<string, () => void> = {
  'add-contact': () => createContactsModule().add('Ada Lovelace', 'ada@example.org', 'corr-budget'),
};

let restore: () => void;
beforeAll(() => {
  restore = useEventSink({ write: () => undefined });
});
afterAll(() => restore());

it('every path stays within its budget', () => {
  const problems: string[] = [];
  for (const [name, budget] of Object.entries(budgets.paths)) {
    const run = paths[name];
    if (!run) {
      problems.push(`checks/budgets.json sets a budget for ${name}, which this test does not run`);
      continue;
    }
    resetCounts();
    run();
    const counts = readCounts();
    for (const [call, most] of Object.entries(budget.calls ?? {})) {
      const made = counts[call] ?? 0;
      if (made > most) problems.push(`${name} made ${made} calls to ${call}; its budget is ${most}`);
    }
  }
  expect(problems, problems.join('\n')).toEqual([]);
});
