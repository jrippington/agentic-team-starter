import assert from 'node:assert/strict';
import { test } from 'node:test';
import { summarise } from '../../src/quoting/summary.ts';

test('the summary gives the annual premium in pounds', () => {
  const quote = { id: 'Q-1001', createdAt: new Date('2026-03-02T09:00:00Z'), premiumPence: 41233 };
  assert.equal(summarise(quote), 'Quote Q-1001: £412.33 a year');
});
