import assert from 'node:assert/strict';
import { test } from 'node:test';
import { summarise } from '../src/summary.mjs';

const quote = { id: 'Q-1001', createdAt: new Date('2026-03-02T09:00:00Z'), premiumPence: 41233 };

test('the summary shows the premium in pounds', () => {
  assert.match(summarise(quote), /£412\.33 a year/);
});

test('the summary shows the last day the quote can be accepted', () => {
  assert.equal(summarise(quote), 'Quote Q-1001: £412.33 a year, valid until 2026-04-01');
});
