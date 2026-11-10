export interface QuoteDetails {
  coverBasePence: number;
  driverAge: number;
  noClaimsYears: number;
}

export interface PricingStrategy {
  price(details: QuoteDetails): number;
}

class StandardPricingStrategy implements PricingStrategy {
  price(details: QuoteDetails): number {
    const youngDriverLoading = details.driverAge < 25 ? 30_000 : 0;
    const noClaimsDiscount = Math.min(details.noClaimsYears, 5) * 2_500;
    return details.coverBasePence + youngDriverLoading - noClaimsDiscount;
  }
}

export function createPricingStrategy(product: 'motor'): PricingStrategy {
  switch (product) {
    case 'motor':
      return new StandardPricingStrategy();
  }
}
