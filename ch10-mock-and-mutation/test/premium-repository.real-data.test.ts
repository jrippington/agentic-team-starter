import type { PGlite } from '@electric-sql/pglite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { openDatabase } from '../src/db.ts';
import { createPremiumRepository } from '../src/premium-repository.ts';

// The same question as the mocked tests, asked of a real PostgreSQL database
// (PGlite, in memory) holding real rows. Remove ".skip" to run it.
describe.skip('premium repository against real data', () => {
  let db: PGlite;

  beforeEach(async () => {
    db = await openDatabase();
    await db.exec(`
      INSERT INTO policy_premiums (policy_id, version, premium_pence) VALUES
        ('POL-4001', 1, 41233),
        ('POL-4001', 2, 45000),
        ('POL-4002', 1, 39000);
    `);
  });

  afterEach(async () => {
    await db.close();
  });

  it('returns the premium of the latest version', async () => {
    const premium = await createPremiumRepository(db).findCurrentPremium('POL-4001');

    expect(premium).toBe(45_000);
  });
});
