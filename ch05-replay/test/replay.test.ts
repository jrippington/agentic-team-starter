import type { PGlite } from '@electric-sql/pglite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { openDatabase } from '../src/db.ts';
import { handleNotification, type ProviderNotification } from '../src/notification-handler.ts';

const succeeded: ProviderNotification = {
  notificationId: 'ntf_1001',
  paymentReference: 'pay_2001',
  policyId: 'POL-4001',
  amountPence: 41233,
  outcome: 'succeeded',
};

let db: PGlite;

beforeEach(async () => {
  db = await openDatabase();
});

afterEach(async () => {
  await db.close();
});

async function countRows(table: 'payments' | 'handled_notifications'): Promise<number> {
  const result = await db.query<{ count: number }>(`SELECT count(*)::int AS count FROM ${table}`);
  return result.rows[0].count;
}

describe('payment notification handler', () => {
  it('records one payment when the same notification is delivered twice', async () => {
    await handleNotification(db, succeeded);
    await handleNotification(db, succeeded);

    expect(await countRows('payments'), 'payments recorded').toBe(1);
  });

  it('records a payment for each different notification', async () => {
    await handleNotification(db, succeeded);
    await handleNotification(db, { ...succeeded, notificationId: 'ntf_1002', paymentReference: 'pay_2002' });

    expect(await countRows('payments'), 'payments recorded').toBe(2);
  });

  // The database refuses any payment of zero pence. That refusal stands in for
  // any failure between recording the notification and recording the payment.
  it('does not mark a notification as handled when its payment is not recorded', async () => {
    const refused = { ...succeeded, notificationId: 'ntf_1003', amountPence: 0 };

    await expect(handleNotification(db, refused)).rejects.toThrow();

    expect(await countRows('handled_notifications'), 'notifications marked as handled').toBe(0);
  });
});
