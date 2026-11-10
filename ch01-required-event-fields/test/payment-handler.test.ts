import { describe, expect, it } from 'vitest';
import { createRecordingSink } from '../src/events.ts';
import { handlePaymentNotification, type PaymentStore } from '../src/payment-handler.ts';

describe('payment handler', () => {
  it('records a successful payment against its policy', () => {
    const payments: PaymentStore = new Map();

    handlePaymentNotification(
      {
        notificationId: 'ntf_1001',
        outcome: 'succeeded',
        paymentReference: 'pay_2001',
        amountPence: 41233,
        metadata: { quoteId: 'QTE-3001', policyId: 'POL-4001' },
      },
      payments,
      createRecordingSink(),
    );

    expect(payments.get('pay_2001')).toEqual({
      paymentReference: 'pay_2001',
      quoteId: 'QTE-3001',
      policyId: 'POL-4001',
      amountPence: 41233,
      status: 'succeeded',
    });
  });

  it('records a failed payment as failed', () => {
    const payments: PaymentStore = new Map();

    handlePaymentNotification(
      {
        notificationId: 'ntf_1002',
        outcome: 'failed',
        paymentReference: 'pay_2002',
        amountPence: 41233,
        failureReason: 'card declined',
        metadata: { quoteId: 'QTE-3002', policyId: 'POL-4002' },
      },
      payments,
      createRecordingSink(),
    );

    expect(payments.get('pay_2002')?.status).toBe('failed');
  });
});
