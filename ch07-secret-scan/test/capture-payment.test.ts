import { readFileSync, rmSync } from 'node:fs';
import { beforeAll, expect, it } from 'vitest';
import { capturePayment, type ProviderRequest } from '../src/capture-payment.ts';
import { createFileLogger } from '../src/logger.ts';

// The log this test writes. The secret scan reads it after the test has run.
const logFile = 'logs/capture-payment.log';

// A stand-in for the provider's credential, in the provider's live format so
// that the scan recognises it if it reaches a log. It is put together while
// the test runs, so no credential is written in the source.
const credential = ['prov', 'live', 'FAKE'.repeat(6)].join('_');

beforeAll(() => {
  rmSync('logs', { recursive: true, force: true });
});

it('captures a payment, sending the credential to the provider only', async () => {
  const sent: ProviderRequest[] = [];
  const provider = {
    credential,
    send: async (request: ProviderRequest) => {
      sent.push(request);
      return { status: 'captured' as const };
    },
  };

  const response = await capturePayment(
    { paymentReference: 'pay_2001', policyId: 'POL-4001', amountPence: 41233 },
    provider,
    createFileLogger(logFile),
  );

  expect(response.status).toBe('captured');
  expect(sent[0].headers.authorization).toBe(`Bearer ${credential}`);
  const logged = readFileSync(logFile, 'utf8').trim().split('\n').map((line) => JSON.parse(line));
  expect(logged.map((entry) => entry.message)).toContain('payment.capture.completed');
});
