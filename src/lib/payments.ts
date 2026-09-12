export type PaymentMethodType = 'cash' | 'card' | 'gcash' | 'maya' | 'bank_transfer' | 'insurance';

export type PaymentState = 'idle' | 'pending' | 'processing' | 'success' | 'failed';

export interface PaymentRequest {
  amountCents: number;
  method: PaymentMethodType;
  description: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  referenceNumber?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  method: PaymentMethodType;
  amountCents: number;
  status: PaymentState;
  message: string;
  referenceNumber?: string;
}

export interface PaymentProvider {
  initiatePayment(request: PaymentRequest): Promise<PaymentResult>;
  confirmPayment(transactionId: string): Promise<PaymentResult>;
  getStatus(transactionId: string): Promise<PaymentState>;
}

let txCounter = 0;
function mockTxId(): string {
  txCounter++;
  return `MOCK-TXN-${Date.now()}-${txCounter}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockPaymentProvider implements PaymentProvider {
  private transactions = new Map<string, PaymentResult>();

  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    const txId = mockTxId();
    const result: PaymentResult = {
      success: false,
      transactionId: txId,
      method: request.method,
      amountCents: request.amountCents,
      status: 'pending',
      message: this.getPendingMessage(request.method),
      referenceNumber: request.method === 'bank_transfer' ? `BT-${Date.now().toString(36).toUpperCase()}` : undefined,
    };
    this.transactions.set(txId, result);
    return { ...result };
  }

  async confirmPayment(transactionId: string): Promise<PaymentResult> {
    const tx = this.transactions.get(transactionId);
    if (!tx) {
      return { success: false, transactionId, method: 'cash', amountCents: 0, status: 'failed', message: 'Transaction not found' };
    }

    tx.status = 'processing';
    tx.message = 'Processing payment...';
    await delay(1500);

    const succeeds = Math.random() > 0.1;
    tx.status = succeeds ? 'success' : 'failed';
    tx.success = succeeds;
    tx.message = succeeds ? this.getSuccessMessage(tx.method) : 'Payment could not be processed. Please try again.';

    return { ...tx };
  }

  async getStatus(transactionId: string): Promise<PaymentState> {
    return this.transactions.get(transactionId)?.status ?? 'idle';
  }

  private getPendingMessage(method: PaymentMethodType): string {
    switch (method) {
      case 'cash': return 'Payment to be collected at the clinic.';
      case 'card': return 'Processing card payment...';
      case 'gcash': return 'Redirecting to GCash...';
      case 'maya': return 'Redirecting to Maya...';
      case 'bank_transfer': return 'Please transfer to the account below. Payment will be verified within 24 hours.';
      case 'insurance': return 'Claim submitted. Pending insurance verification.';
    }
  }

  private getSuccessMessage(method: PaymentMethodType): string {
    switch (method) {
      case 'cash': return 'Cash payment recorded.';
      case 'card': return 'Card payment completed successfully.';
      case 'gcash': return 'GCash payment confirmed.';
      case 'maya': return 'Maya payment confirmed.';
      case 'bank_transfer': return 'Bank transfer verified.';
      case 'insurance': return 'Insurance claim approved.';
    }
  }
}

export const paymentProvider: PaymentProvider = new MockPaymentProvider();

export const PH_HMOS = [
  'Maxicare',
  'Intellicare',
  'Medicard',
  'PhilHealth',
  'Pacific Cross',
  'Cocolife',
  'EastWest Healthcare',
  'Caritas Health Shield',
  'Generali',
  'AXA Philippines',
  'Sun Life Grepa',
  'Valucare',
  'AsianLife',
  'Insular Health Care',
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  cash: 'Cash (Pay at Clinic)',
  card: 'Credit / Debit Card',
  gcash: 'GCash',
  maya: 'Maya',
  bank_transfer: 'Bank Transfer',
  insurance: 'Insurance / HMO',
};

export const BANK_TRANSFER_DETAILS = {
  bankName: 'BDO Unibank',
  accountName: 'MediSmile Health Technologies Inc.',
  accountNumber: '0012-3456-7890',
};
