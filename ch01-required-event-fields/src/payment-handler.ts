import type { EventSink } from './events.ts';

// What the payment provider sends when a payment succeeds or fails.
export interface ProviderNotification {
  notificationId: string;
  outcome: 'succeeded' | 'failed';
  paymentReference: string;
  amountPence: number;
  failureReason?: string;
  metadata: {
    quoteId: string;
    policyId: string;
  };
}

export interface Payment {
  paymentReference: string;
  quoteId: string;
  policyId: string;
  amountPence: number;
  status: 'succeeded' | 'failed';
}

export type PaymentStore = Map<string, Payment>;

// Records the payment the notification describes and emits one event about it.
export function handlePaymentNotification(
  notification: ProviderNotification,
  payments: PaymentStore,
  events: EventSink,
): Payment {
  const payment: Payment = {
    paymentReference: notification.paymentReference,
    quoteId: notification.metadata.quoteId,
    policyId: notification.metadata.policyId,
    amountPence: notification.amountPence,
    status: notification.outcome,
  };
  payments.set(payment.paymentReference, payment);

  if (payment.status === 'succeeded') {
    events.emit('payment.recorded', {
      notificationId: notification.notificationId,
      paymentReference: payment.paymentReference,
      quoteId: payment.quoteId,
      policyId: payment.policyId,
      amountPence: payment.amountPence,
    });
  } else {
    events.emit('payment.failed', {
      notificationId: notification.notificationId,
      paymentReference: payment.paymentReference,
      quoteId: payment.quoteId,
      policyId: payment.policyId,
      reason: notification.failureReason ?? 'not given',
    });
  }

  return payment;
}
