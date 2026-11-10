import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

// Opens a new PostgreSQL database in memory, with the schema applied.
export async function openDatabase(): Promise<PGlite> {
  const db = await PGlite.create();
  await db.exec(schema);
  return db;
}
