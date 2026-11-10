import { describe, expect, it } from 'vitest';
import { Money } from '../src/money.ts';

describe('Money', () => {
  it.each([
    ['412.325', '412.32'],
    ['412.335', '412.34'],
    ['412.3333', '412.33'],
    ['412.3250001', '412.33'],
    ['-412.325', '-412.32'],
    ['412', '412.00'],
  ])('rounds %s to %s, half to even', (unrounded, rounded) => {
    expect(Money.round(unrounded).toString()).toBe(rounded);
  });
});
