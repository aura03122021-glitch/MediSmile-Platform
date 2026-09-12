import { useState, useEffect } from 'react';
import { User, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';

export default function PatientProfile() {
  const { activeUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!activeUser) return;

    supabase
      .from('profiles')
      .select('full_name, phone, email, address')
      .eq('id', activeUser.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setStatus({ type: 'error', message: 'Could not load your profile.' });
        } else if (data) {
          setFullName(data.full_name ?? '');
          setPhone(data.phone ?? '');
          setEmail(data.email ?? '');
          setAddress(data.address ?? '');
        }
        setLoading(false);
      });
  }, [activeUser]);

  async function handleSave() {
    if (!activeUser) return;
    setSaving(true);
    setStatus(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
      })
      .eq('id', activeUser.id);

    setSaving(false);

    if (error) {
      setStatus({ type: 'error', message: 'Failed to save changes. Please try again.' });
    } else {
      setStatus({ type: 'success', message: 'Profile updated successfully.' });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#0D6E6E] border-t-transparent" />
          <p className="mt-3 text-sm text-[#607181]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-[#e5ebed] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#0D6E6E]/10 text-[#0D6E6E]">
            <User size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A2B3C]">My Profile</h2>
            <p className="text-xs text-[#607181]">Update your personal information</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1A2B3C]">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm text-[#1A2B3C] focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1A2B3C]">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0917 123 4567"
              className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm text-[#1A2B3C] placeholder:text-[#9aa8b0] focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1A2B3C]">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Unit 4B, Sitio Sapinit, Brgy. San Juan"
              className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm text-[#1A2B3C] placeholder:text-[#9aa8b0] focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1A2B3C]">Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-[#dce8e8] bg-[#f8fafb] px-3.5 py-2.5 text-sm text-[#607181]"
            />
            <p className="mt-1 text-[11px] text-[#9aa8b0]">Email cannot be changed here.</p>
          </div>
        </div>

        {status && (
          <div className={`mt-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {status.message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !fullName.trim()}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D6E6E] py-2.5 text-sm font-bold text-white transition hover:bg-[#095a5a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}