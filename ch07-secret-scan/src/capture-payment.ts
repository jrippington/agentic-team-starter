import type { Logger } from './logger.ts';

export interface ProviderRequest {
  url: string;
  headers: Record<string, string>;
  body: { paymentReference: string; amountPence: number };
}

export interface ProviderResponse {
  status: 'captured' | 'declined';
}

export interface Provider {
  credential: string;
  send(request: ProviderRequest): Promise<ProviderResponse>;
}

export interface PaymentToCapture {
  paymentReference: string;
  policyId: string;
  amountPence: number;
}

// Asks the payment provider to take a payment the customer has authorised,
// and logs the request and its outcome without the credential.
export async function capturePayment(
  payment: PaymentToCapture,
  provider: Provider,
  log: Logger,
): Promise<ProviderResponse> {
  const request: ProviderRequest = {
    url: 'https://provider.example/v1/captures',
    headers: { authorization: `Bearer ${provider.credential}` },
    body: { paymentReference: payment.paymentReference, amountPence: payment.amountPence },
  };

  log.info('payment.capture.requested', {
    paymentReference: payment.paymentReference,
    policyId: payment.policyId,
    amountPence: payment.amountPence,
  });
  const response = await provider.send(request);
  log.info('payment.capture.completed', {
    paymentReference: payment.paymentReference,
    policyId: payment.policyId,
    status: response.status,
  });

  return response;
}
