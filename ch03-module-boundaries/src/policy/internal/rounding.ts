// Rounds an amount to the penny, half to even: 412.325 becomes 412.32.
export function roundToPence(amount: number): number {
  const pence = Number((amount * 100).toPrecision(15));
  const whole = Math.floor(pence);
  if (pence - whole !== 0.5) return Math.round(pence) / 100;
  return (whole % 2 === 0 ? whole : whole + 1) / 100;
}
