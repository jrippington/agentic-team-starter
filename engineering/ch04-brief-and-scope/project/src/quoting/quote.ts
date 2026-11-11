export interface Quote {
  readonly id: string;
  readonly createdAt: Date;
  readonly premiumPence: number;
}

// A quote can be accepted for this many days after it was created.
export const QUOTE_VALID_DAYS = 30;
