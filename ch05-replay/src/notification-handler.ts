import type { PGlite } from '@electric-sql/pglite';

// What the payment provider sends when a payment succeeds or fails. The
// provider may deliver the same notification more than once.
export interface ProviderNotification {
  notificationId: string;
  paymentReference: string;
  policyId: string;
  amountPence: number;
  outcome: 'succeeded' | 'failed';
}

// Applies a notification at most once, however many times it is delivered.
// The provider's notification identifier is the idempotency key. It is
// recorded in the same transaction as the payment, so either both are
// written or neither is.
export async function handleNotification(
  db: PGlite,
  notification: ProviderNotification,
): Promise<'applied' | 'duplicate'> {
  return db.transaction(async (tx) => {
    const claimed = await tx.query(
      `INSERT INTO handled_notifications (notification_id) VALUES ($1)
       ON CONFLICT (notification_id) DO NOTHING
       RETURNING notification_id`,
      [notification.notificationId],
    );
    if (claimed.rows.length === 0) return 'duplicate';

    await tx.query(
      `INSERT INTO payments (payment_reference, policy_id, amount_pence, status)
       VALUES ($1, $2, $3, $4)`,
      [notification.paymentReference, notification.policyId, notification.amountPence, notification.outcome],
    );
    return 'applied';
  });
}
