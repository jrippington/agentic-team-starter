// An amount of money in pounds, held as a whole number of pence.
// Money is the one home of the rounding rule: half to even.
export class Money {
  readonly pence: bigint;

  private constructor(pence: bigint) {
    this.pence = pence;
  }

  static fromPence(pence: bigint | number): Money {
    return new Money(BigInt(pence));
  }

  // Rounds an unrounded amount, written as a decimal such as "412.325", to the penny.
  static round(amount: string): Money {
    return new Money(roundHalfEven(amount));
  }

  plus(other: Money): Money {
    return new Money(this.pence + other.pence);
  }

  equals(other: Money): boolean {
    return this.pence === other.pence;
  }

  toString(): string {
    const sign = this.pence < 0n ? '-' : '';
    const size = this.pence < 0n ? -this.pence : this.pence;
    return `${sign}${size / 100n}.${String(size % 100n).padStart(2, '0')}`;
  }
}

const DECIMAL = /^(-?)(\d+)(?:\.(\d+))?$/;

// Half to even: an amount exactly halfway between two pence goes to the even
// one, so 412.325 becomes 412.32 and 412.335 becomes 412.34. Any other amount
// goes to the nearer penny, so 412.3333 becomes 412.33.
export function roundHalfEven(amount: string): bigint {
  const parts = DECIMAL.exec(amount);
  if (parts === null) throw new Error(`Not a decimal amount: ${amount}`);
  const [, sign, whole, fraction = ''] = parts;
  const pence = BigInt(whole + fraction.padEnd(2, '0').slice(0, 2));
  const rest = fraction.slice(2).replace(/0+$/, '');
  const roundUp = rest > '5' || (rest === '5' && pence % 2n === 1n);
  const rounded = roundUp ? pence + 1n : pence;
  return sign === '-' ? -rounded : rounded;
}
