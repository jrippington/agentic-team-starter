// The contacts module's published interface: the one file another module may
// import. The module keeps a list of contacts. It is an example of the shape
// a module takes here; replace it with your first module.
import { randomUUID } from 'node:crypto';
import { recordEvent } from '../lib/events.ts';
import { createContactStore, tidyName, type Contact } from './internal/contact-store.ts';

export type { Contact } from './internal/contact-store.ts';

export interface ContactsModule {
  add(name: string, email: string, correlationId: string): Contact;
  find(id: string): Contact | undefined;
}

export function createContactsModule(): ContactsModule {
  const store = createContactStore();
  return {
    add(name, email, correlationId) {
      const contact: Contact = { id: randomUUID(), name: tidyName(name), email: email.trim().toLowerCase() };
      store.save(contact);
      // The event names the contact by its identifier only, never by name or email.
      recordEvent('contact.added', { correlationId, contactId: contact.id });
      return contact;
    },

    find(id) {
      return store.find(id);
    },
  };
}
