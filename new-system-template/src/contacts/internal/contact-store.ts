// Internal to the contacts module: where contacts are kept. Here it is a map in
// memory; in your project it would be the module's own tables.
import { countCall } from '../../lib/metrics.ts';

export interface Contact {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

export interface ContactStore {
  save(contact: Contact): void;
  find(id: string): Contact | undefined;
}

export function createContactStore(): ContactStore {
  const contacts = new Map<string, Contact>();
  return {
    save(contact) {
      countCall('contacts.save');
      contacts.set(contact.id, contact);
    },
    find(id) {
      return contacts.get(id);
    },
  };
}

// A name with its spaces tidied: none at either end, and one between words.
export function tidyName(name: string): string {
  const tidied = name.trim().replace(/\s+/g, ' ');
  if (tidied === '') throw new Error('a contact needs a name');
  return tidied;
}
