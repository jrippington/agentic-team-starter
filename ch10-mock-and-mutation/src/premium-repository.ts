// The part of a database connection the repository uses. PGlite provides it.
export interface Database {
  query<T>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export interface PremiumRepository {
  findCurrentPremium(policyId: string): Promise<number | null>;
}

export function createPremiumRepository(db: Database): PremiumRepository {
  return {
    // The policy's current annual premium in pence, or null if it has none.
    async findCurrentPremium(policyId) {
      const result = await db.query<{ premium_pence: number }>(
        `SELECT premium_pence FROM policy_premiums
         WHERE policy_id = $1
         ORDER BY version
         LIMIT 1`,
        [policyId],
      );
      return result.rows[0]?.premium_pence ?? null;
    },
  };
}
