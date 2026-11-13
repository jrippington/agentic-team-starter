import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createContactsModule } from '../src/contacts/index.ts';
import { useEventSink } from '../src/lib/events.ts';

describe('contacts', () => {
  let restore: () => void;
  beforeEach(() => {
    restore = useEventSink({ write: () => undefined });
  });
  afterEach(() => restore());

  it('adds a contact with its name and email tidied, and finds it again', () => {
    const contacts = createContactsModule();
    const added = contacts.add('  Ada   Lovelace ', ' Ada@Example.org', 'c1');
    expect(added.name).toBe('Ada Lovelace');
    expect(added.email).toBe('ada@example.org');
    expect(contacts.find(added.id)).toEqual(added);
  });

  it('refuses a contact with no name', () => {
    expect(() => createContactsModule().add('   ', 'someone@example.org', 'c2')).toThrow('a contact needs a name');
  });
});
