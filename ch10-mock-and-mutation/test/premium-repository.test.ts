import { describe, expect, it, vi } from 'vitest';
import { createPremiumRepository } from '../src/premium-repository.ts';

describe('premium repository', () => {
  it('queries the premiums table for the policy', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [{ premium_pence: 45_000 }] }) };

    await createPremiumRepository(db).findCurrentPremium('POL-4001');

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM policy_premiums'), ['POL-4001']);
  });

  it('returns the premium from the row the database returns', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [{ premium_pence: 45_000 }] }) };

    const premium = await createPremiumRepository(db).findCurrentPremium('POL-4001');

    expect(premium).toBe(45_000);
  });
});
