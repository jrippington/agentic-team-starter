-- Payments collected: one row for each payment the provider reports.
CREATE TABLE payments (
  id                serial PRIMARY KEY,
  payment_reference text NOT NULL,
  policy_id         text NOT NULL,
  amount_pence      integer NOT NULL CHECK (amount_pence > 0),
  status            text NOT NULL CHECK (status IN ('succeeded', 'failed')),
  recorded_at       timestamptz NOT NULL DEFAULT now()
);

-- Every provider notification already handled, keyed by the provider's own
-- identifier for the notification, which is the same on every delivery.
CREATE TABLE handled_notifications (
  notification_id text PRIMARY KEY,
  handled_at      timestamptz NOT NULL DEFAULT now()
);
