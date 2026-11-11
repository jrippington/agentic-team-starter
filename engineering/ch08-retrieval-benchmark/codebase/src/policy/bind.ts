export interface Policy {
  readonly number: string;
  readonly premiumAnnual: number;
}

let next = 1;

// Bind a policy at the premium the customer accepted.
export function bindPolicy(sourceId: string, premiumAnnual: number): Policy {
  return { number: `AM-${String(next++).padStart(6, '0')}`, premiumAnnual };
}
