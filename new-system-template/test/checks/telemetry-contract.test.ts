// The telemetry-contract check. It drives the real code, keeps every event it
// writes, and holds each to checks/telemetry-contract.json: the type is
// listed, every required field is present, and no field is outside the list.
// It also checks the contract itself: every type says how long its events are
// kept, and every field says whether it identifies a person.
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { createContactsModule } from '../../src/contacts/index.ts';
import { useEventSink, type StructuredEvent } from '../../src/lib/events.ts';

interface FieldRule {
  required?: unknown;
  identifiesAPerson?: unknown;
}
interface EventRule {
  keptForDays?: unknown;
  fields?: Record<string, FieldRule>;
}

const contract: { eventTypes: Record<string, EventRule> } = JSON.parse(
  readFileSync(new URL('../../checks/telemetry-contract.json', import.meta.url), 'utf8'),
);

// Runs every path that writes events. Add each new path here.
function runEveryPath(): void {
  const contacts = createContactsModule();
  contacts.add('Ada Lovelace', 'ada@example.org', 'corr-telemetry');
}

it('every event carries the fields its type lists, and no others', () => {
  const events: StructuredEvent[] = [];
  const restore = useEventSink({ write: (event) => events.push(event) });
  try {
    runEveryPath();
  } finally {
    restore();
  }

  const problems: string[] = [];
  for (const event of events) {
    const rule = contract.eventTypes[event.type];
    if (!rule) {
      problems.push(`${event.type} is not an event type in checks/telemetry-contract.json`);
      continue;
    }
    const listed = rule.fields ?? {};
    for (const [field, { required }] of Object.entries(listed)) {
      const value = event.fields[field];
      if (required === true && (value === undefined || value === '')) problems.push(`${event.type} has no ${field}, which it requires`);
    }
    for (const field of Object.keys(event.fields)) {
      if (!Object.hasOwn(listed, field)) problems.push(`${event.type} carries ${field}, which checks/telemetry-contract.json does not list for it`);
    }
  }
  expect(problems, problems.join('\n')).toEqual([]);
  expect(events.length, 'the paths run here wrote no events').toBeGreaterThan(0);
});

it('every event type says how long it is kept, and every field whether it identifies a person', () => {
  const problems: string[] = [];
  for (const [type, rule] of Object.entries(contract.eventTypes)) {
    if (typeof rule.keptForDays !== 'number' || rule.keptForDays <= 0) problems.push(`${type} does not say for how many days its events are kept`);
    for (const [field, fieldRule] of Object.entries(rule.fields ?? {})) {
      if (typeof fieldRule.required !== 'boolean') problems.push(`${type}.${field} does not say whether it is required`);
      if (typeof fieldRule.identifiesAPerson !== 'boolean') problems.push(`${type}.${field} does not say whether it identifies a person`);
    }
  }
  expect(problems, problems.join('\n')).toEqual([]);
});
