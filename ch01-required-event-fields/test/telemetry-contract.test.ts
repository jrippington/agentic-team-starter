import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createRecordingSink } from '../src/events.ts';
import { handlePaymentNotification, type ProviderNotification } from '../src/payment-handler.ts';

// The rule: every event of a named type carries the fields listed for it.
const requiredFields: Record<string, string[]> = JSON.parse(
  readFileSync(new URL('../required-event-fields.json', import.meta.url), 'utf8'),
);

// One notification for each event type, so that the real handler emits it.
const notificationFor: Record<string, ProviderNotification> = {
  'payment.recorded': {
    notificationId: 'ntf_1001',
    outcome: 'succeeded',
    paymentReference: 'pay_2001',
    amountPence: 41233,
    metadata: { quoteId: 'QTE-3001', policyId: 'POL-4001' },
  },
  'payment.failed': {
    notificationId: 'ntf_1002',
    outcome: 'failed',
    paymentReference: 'pay_2002',
    amountPence: 41233,
    failureReason: 'card declined',
    metadata: { quoteId: 'QTE-3002', policyId: 'POL-4002' },
  },
};

describe('telemetry contract', () => {
  for (const [eventType, fields] of Object.entries(requiredFields)) {
    it(`${eventType} carries its required fields`, () => {
      const notification = notificationFor[eventType];
      expect(notification, `no notification in this test produces ${eventType}`).toBeDefined();

      const sink = createRecordingSink();
      handlePaymentNotification(notification, new Map(), sink);
      const event = sink.events.find((emitted) => emitted.type === eventType);
      expect(event, `the handler emitted no ${eventType} event`).toBeDefined();

      const missing = fields.filter((field) => event?.[field] === undefined);
      expect(missing, `${eventType} is missing required fields`).toEqual([]);
    });
  }
});
