import { describe, expect, it, vi } from 'vitest';
import { renewalNotice } from '../src/renewal-notice.ts';

describe('renewal notice', () => {
  it("asks the repository for the policy's current premium", async () => {
    const repository = { findCurrentPremium: vi.fn().mockResolvedValue(45_000) };

    await renewalNotice(repository, 'POL-4001');

    expect(repository.findCurrentPremium).toHaveBeenCalledWith('POL-4001');
  });

  it('shows the premium the repository returns', async () => {
    const repository = { findCurrentPremium: vi.fn().mockResolvedValue(45_000) };

    const notice = await renewalNotice(repository, 'POL-4001');

    expect(notice).toBe('Policy POL-4001: your current annual premium is £450.00.');
  });
});
