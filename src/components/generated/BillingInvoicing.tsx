import { useEffect, useMemo, useState } from 'react';
import { Check, FileText, Search } from 'lucide-react';
import { formatPHP } from '../../lib/currency';
import { fetchInvoices, InvoiceRecord, updateInvoiceStatus } from '../../lib/live-data';

const tabs = ['all', 'paid', 'pending', 'overdue', 'insurance_pending'];

export default function BillingInvoicing() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoices().then(setInvoices).catch((loadError: Error) => setError(loadError.message));
  }, []);

  const filteredInvoices = useMemo(() => invoices.filter((invoice) => {
    const matchesQuery = `${invoice.invoiceNumber} ${invoice.patientName} ${invoice.service}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (tab === 'all' || invoice.status === tab);
  }), [invoices, query, tab]);

  async function markPaid(invoice: InvoiceRecord) {
    try {
      await updateInvoiceStatus(invoice.id, 'paid');
      setInvoices((current) => current.map((item) => item.id === invoice.id ? { ...item, status: 'paid' } : item));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update invoice.');
    }
  }

  const total = invoices.reduce((sum, invoice) => sum + invoice.amountCents, 0);
  const outstanding = invoices.filter((invoice) => invoice.status === 'pending' || invoice.status === 'overdue').reduce((sum, invoice) => sum + invoice.amountCents, 0);

  return (
    <div className="text-[#1A2B3C] antialiased">
      <section className="py-7"><p className="mb-1 text-xs font-bold uppercase tracking-[0.13em] text-[#FF6B6B]">Financial workspace</p><h1 className="text-[28px] font-bold tracking-[-0.035em]">Billing &amp; Invoicing</h1><p className="mt-1.5 text-sm text-[#718290]">Track live invoices and update payment status.</p></section>
      <section className="grid gap-4 sm:grid-cols-3">
        <Summary label="Total invoices" value={String(invoices.length)} />
        <Summary label="Invoice value" value={formatPHP(total)} />
        <Summary label="Outstanding" value={formatPHP(outstanding)} />
      </section>
      <section className="mt-5 overflow-hidden rounded-[14px] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#edf1f3] p-5"><h2 className="mr-auto text-[18px] font-bold">Invoices</h2><label className="relative"><Search size={15} className="absolute left-3 top-3 text-[#9aa8b0]" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 w-[220px] rounded-lg border border-[#E0E7EF] pl-9 pr-3 text-xs outline-none focus:border-[#0D6E6E]" placeholder="Search invoices" /></label>{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${tab === item ? 'bg-[#0D6E6E] text-white' : 'bg-[#f1f5f6] text-[#71808b]'}`}>{item.replace('_', ' ')}</button>)}</div>
        {error && <p className="p-5 text-sm text-red-600">Unable to load invoices: {error}</p>}
        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead><tr className="border-b border-[#edf1f3] text-[10px] uppercase tracking-[0.08em] text-[#94a0a8]"><th className="px-5 py-3">Invoice</th><th className="py-3">Patient</th><th className="py-3">Service</th><th className="py-3">Date</th><th className="py-3">Amount</th><th className="py-3">Status</th><th className="py-3 pr-5">Action</th></tr></thead><tbody>{filteredInvoices.map((invoice) => <tr key={invoice.id} className="border-b border-[#f0f3f4] text-xs last:border-0"><td className="px-5 py-3.5 font-bold text-[#0D6E6E]">{invoice.invoiceNumber}</td><td className="py-3.5 font-semibold">{invoice.patientName}</td><td className="py-3.5 text-[#687b87]">{invoice.service}</td><td className="py-3.5 text-[#7f8d96]">{new Date(invoice.date).toLocaleDateString('en-PH')}</td><td className="py-3.5 font-bold">{formatPHP(invoice.amountCents)}</td><td className="py-3.5"><span className="rounded-full bg-[#e5f4f3] px-2 py-1 text-[10px] font-bold capitalize text-[#0D6E6E]">{invoice.status.replace('_', ' ')}</span></td><td className="py-3.5 pr-5">{invoice.status !== 'paid' && invoice.status !== 'voided' ? <button onClick={() => markPaid(invoice)} className="inline-flex items-center gap-1 font-bold text-[#0D6E6E] hover:underline"><Check size={13} /> Mark paid</button> : <FileText size={15} className="text-[#9aa8b0]" />}</td></tr>)}</tbody></table></div>
        {!error && filteredInvoices.length === 0 && <p className="p-10 text-center text-sm text-[#718290]">No invoices found.</p>}
      </section>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <article className="rounded-[14px] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]"><p className="text-xs text-[#718290]">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></article>;
}
