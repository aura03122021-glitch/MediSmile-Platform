import { useState } from 'react';
import { CreditCard, Banknote, Smartphone, Building2, ShieldCheck, ChevronRight, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { PaymentMethodType, PaymentState, PAYMENT_METHOD_LABELS, PH_HMOS, BANK_TRANSFER_DETAILS, paymentProvider } from '../../lib/payments';
import { formatPHP } from '../../lib/currency';

interface PaymentMethodSelectorProps {
  amountCents: number;
  description: string;
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

const METHOD_ICONS: Record<PaymentMethodType, typeof CreditCard> = {
  cash: Banknote,
  card: CreditCard,
  gcash: Smartphone,
  maya: Smartphone,
  bank_transfer: Building2,
  insurance: ShieldCheck,
};

const METHOD_ORDER: PaymentMethodType[] = ['cash', 'card', 'gcash', 'maya', 'bank_transfer', 'insurance'];

export default function PaymentMethodSelector({ amountCents, description, onComplete, onCancel }: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [resultMessage, setResultMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

  async function handlePay() {
    if (!selectedMethod) return;

    setPaymentState('pending');
    const result = await paymentProvider.initiatePayment({
      amountCents,
      method: selectedMethod,
      description,
      insuranceProvider: selectedMethod === 'insurance' ? insuranceProvider : undefined,
      insurancePolicyNumber: selectedMethod === 'insurance' ? insurancePolicyNumber : undefined,
    });

    setTransactionId(result.transactionId);
    if (result.referenceNumber) setReferenceNumber(result.referenceNumber);
    setResultMessage(result.message);

    if (selectedMethod === 'cash' || selectedMethod === 'bank_transfer' || selectedMethod === 'insurance') {
      setPaymentState('success');
      return;
    }

    setPaymentState('processing');
    const confirmation = await paymentProvider.confirmPayment(result.transactionId);
    setPaymentState(confirmation.status);
    setResultMessage(confirmation.message);
  }

  if (paymentState === 'success' || paymentState === 'failed') {
    const isSuccess = paymentState === 'success';
    return (
      <div className="rounded-2xl border border-[#e7eeee] bg-white p-6 text-center">
        <div className={`mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full ${isSuccess ? 'bg-[#e6f4ea] text-[#23844b]' : 'bg-[#ffe8e8] text-[#d65353]'}`}>
          {isSuccess ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
        </div>
        <h3 className="text-xl font-bold text-[#1A2B3C]">{isSuccess ? 'Payment Recorded' : 'Payment Failed'}</h3>
        <p className="mt-2 text-sm text-[#607181]">{resultMessage}</p>
        {transactionId && <p className="mt-2 text-xs text-[#9aa8b0]">Reference: {transactionId}</p>}
        {referenceNumber && selectedMethod === 'bank_transfer' && (
          <div className="mx-auto mt-4 max-w-xs rounded-xl bg-[#f0f7f7] p-4 text-left text-xs">
            <p className="font-bold text-[#0D6E6E]">Bank Transfer Details</p>
            <p className="mt-2 text-[#607181]">Bank: {BANK_TRANSFER_DETAILS.bankName}</p>
            <p className="text-[#607181]">Account: {BANK_TRANSFER_DETAILS.accountName}</p>
            <p className="text-[#607181]">Number: {BANK_TRANSFER_DETAILS.accountNumber}</p>
            <p className="mt-2 font-semibold text-[#1A2B3C]">Ref #: {referenceNumber}</p>
          </div>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => onComplete(isSuccess)} className="rounded-xl bg-[#0D6E6E] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#095a5a]">
            {isSuccess ? 'Done' : 'Close'}
          </button>
          {!isSuccess && (
            <button onClick={() => { setPaymentState('idle'); setSelectedMethod(null); }} className="rounded-xl border border-[#dce8e8] px-6 py-2.5 text-sm font-bold text-[#0D6E6E] hover:bg-[#f2fafa]">
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (paymentState === 'pending' || paymentState === 'processing') {
    return (
      <div className="rounded-2xl border border-[#e7eeee] bg-white p-8 text-center">
        <Loader2 size={40} className="mx-auto animate-spin text-[#0D6E6E]" />
        <p className="mt-4 text-sm font-semibold text-[#1A2B3C]">{resultMessage || 'Processing payment...'}</p>
        <p className="mt-2 text-xs text-[#9aa8b0]">Please do not close this window.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e7eeee] bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#1A2B3C]">Select Payment Method</h3>
          <p className="mt-1 text-sm text-[#607181]">{description}</p>
        </div>
        <p className="text-right">
          <span className="text-xs text-[#9aa8b0]">Amount Due</span>
          <br />
          <span className="text-xl font-bold text-[#0D6E6E]">{formatPHP(amountCents)}</span>
        </p>
      </div>

      <div className="space-y-2">
        {METHOD_ORDER.map(method => {
          const Icon = METHOD_ICONS[method];
          const isSelected = selectedMethod === method;
          return (
            <button key={method} onClick={() => setSelectedMethod(method)}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition ${isSelected ? 'border-[#0D6E6E] bg-[#f2fafa]' : 'border-[#e7eeee] hover:border-[#9fc8c5] hover:bg-[#fafcfc]'}`}>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${isSelected ? 'bg-[#0D6E6E] text-white' : 'bg-[#e5f4f3] text-[#0D6E6E]'}`}>
                <Icon size={18} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-[#1A2B3C]">{PAYMENT_METHOD_LABELS[method]}</span>
                <span className="block text-xs text-[#9aa8b0]">{getMethodHint(method)}</span>
              </span>
              <ChevronRight size={16} className={isSelected ? 'text-[#0D6E6E]' : 'text-[#cdd6d6]'} />
            </button>
          );
        })}
      </div>

      {selectedMethod === 'insurance' && (
        <div className="mt-4 space-y-3 rounded-xl bg-[#f8fafb] p-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1A2B3C]">Insurance / HMO Provider</label>
            <select value={insuranceProvider} onChange={e => setInsuranceProvider(e.target.value)}
              className="w-full rounded-lg border border-[#dce8e8] bg-white px-3 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none">
              <option value="">Select provider...</option>
              {PH_HMOS.map(hmo => <option key={hmo} value={hmo}>{hmo}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1A2B3C]">Policy Number</label>
            <input type="text" value={insurancePolicyNumber} onChange={e => setInsurancePolicyNumber(e.target.value)}
              placeholder="e.g. MXC-12345678" className="w-full rounded-lg border border-[#dce8e8] px-3 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none" />
          </div>
        </div>
      )}

      {selectedMethod === 'card' && (
        <div className="mt-4 space-y-3 rounded-xl bg-[#f8fafb] p-4">
          <p className="flex items-center gap-2 text-xs text-[#b97812]">
            <AlertCircle size={14} /> This is a demo — no real card data is processed.
          </p>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1A2B3C]">Card Number</label>
            <input type="text" placeholder="4242 4242 4242 4242" maxLength={19}
              className="w-full rounded-lg border border-[#dce8e8] px-3 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1A2B3C]">Expiry</label>
              <input type="text" placeholder="MM/YY" maxLength={5}
                className="w-full rounded-lg border border-[#dce8e8] px-3 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1A2B3C]">CVV</label>
              <input type="text" placeholder="123" maxLength={4}
                className="w-full rounded-lg border border-[#dce8e8] px-3 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none" />
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button onClick={onCancel} className="flex-1 rounded-xl border border-[#dce8e8] py-3 text-sm font-bold text-[#607181] hover:bg-[#f8fafb]">
          Cancel
        </button>
        <button onClick={handlePay} disabled={!selectedMethod || (selectedMethod === 'insurance' && (!insuranceProvider || !insurancePolicyNumber))}
          className="flex-1 rounded-xl bg-[#0D6E6E] py-3 text-sm font-bold text-white shadow-[0_6px_16px_rgba(13,110,110,0.2)] transition hover:bg-[#095a5a] disabled:opacity-50 disabled:shadow-none">
          Pay {formatPHP(amountCents)}
        </button>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-[#9aa8b0]">
        <ShieldCheck size={13} className="text-[#0D6E6E]" /> All transactions are encrypted and secure
      </p>
    </div>
  );
}

function getMethodHint(method: PaymentMethodType): string {
  switch (method) {
    case 'cash': return 'Pay when you visit the clinic';
    case 'card': return 'Visa, Mastercard, JCB accepted';
    case 'gcash': return 'Pay via GCash e-wallet';
    case 'maya': return 'Pay via Maya (formerly PayMaya)';
    case 'bank_transfer': return 'BDO, BPI, UnionBank, and more';
    case 'insurance': return 'PhilHealth, Maxicare, Intellicare, etc.';
  }
}
