import { useState, useEffect } from 'react';
import { Pill, Stethoscope, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';

interface PrescriptionRow {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string | null;
  instructions: string | null;
  issued_at: string;
  doctor_profiles: {
    clinic_name: string;
    profiles: {
      full_name: string;
    } | null;
  } | null;
}

export default function PrescriptionRecords() {
  const { activeUser } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeUser) return;

    supabase
      .from('prescriptions')
      .select(`
        id,
        medication_name,
        dosage,
        frequency,
        duration,
        instructions,
        issued_at,
        doctor_profiles (
          clinic_name,
          profiles ( full_name )
        )
      `)
      .eq('patient_id', activeUser.id)
      .order('issued_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError('Could not load your prescriptions.');
        } else {
          setPrescriptions((data as unknown as PrescriptionRow[]) ?? []);
        }
        setLoading(false);
      });
  }, [activeUser]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#0D6E6E] border-t-transparent" />
          <p className="mt-3 text-sm text-[#607181]">Loading your prescriptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white py-16 text-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e5ebed] bg-white py-16 text-center">
        <Pill size={40} className="mb-3 text-[#dce8e8]" />
        <p className="text-sm font-semibold text-[#1A2B3C]">No prescriptions yet</p>
        <p className="mt-1 text-xs text-[#607181]">Prescriptions issued by your doctor will show up here.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {prescriptions.map((p) => {
        const date = new Date(p.issued_at);
        const dateStr = date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
        const doctorName = p.doctor_profiles?.profiles?.full_name ?? 'Unknown Doctor';
        const clinicName = p.doctor_profiles?.clinic_name ?? '';

        return (
          <div key={p.id} className="rounded-2xl border border-[#e5ebed] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0D6E6E]/10 text-[#0D6E6E]">
                <Pill size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1A2B3C]">{p.medication_name}</p>
                <p className="mt-0.5 text-xs text-[#607181]">
                  {p.dosage} &middot; {p.frequency}
                  {p.duration && <> &middot; {p.duration}</>}
                </p>
                {p.instructions && (
                  <p className="mt-1.5 rounded-lg bg-[#f8fafb] px-3 py-2 text-xs text-[#1A2B3C]">
                    {p.instructions}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#f0f3f5] pt-3 text-xs text-[#607181]">
              <span className="flex items-center gap-1.5">
                <Stethoscope size={13} />
                {doctorName}{clinicName && ` · ${clinicName}`}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {dateStr}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}