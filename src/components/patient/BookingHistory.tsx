import { useState, useEffect } from 'react';
import { CalendarClock, Stethoscope, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

interface BookingRow {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  service_type: string;
  reason_for_visit: string | null;
  status: AppointmentStatus;
  doctor_profiles: {
    clinic_name: string;
    profiles: {
      full_name: string;
    } | null;
  } | null;
}

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-600',
  no_show: 'bg-slate-100 text-slate-600',
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

export default function BookingHistory() {
  const { activeUser } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeUser) return;

    supabase
      .from('appointments')
      .select(`
        id,
        scheduled_at,
        duration_minutes,
        service_type,
        reason_for_visit,
        status,
        doctor_profiles (
          clinic_name,
          profiles ( full_name )
        )
      `)
      .eq('patient_id', activeUser.id)
      .order('scheduled_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError('Could not load your booking history.');
        } else {
          setBookings((data as unknown as BookingRow[]) ?? []);
        }
        setLoading(false);
      });
  }, [activeUser]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#0D6E6E] border-t-transparent" />
          <p className="mt-3 text-sm text-[#607181]">Loading your bookings...</p>
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

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e5ebed] bg-white py-16 text-center">
        <CalendarClock size={40} className="mb-3 text-[#dce8e8]" />
        <p className="text-sm font-semibold text-[#1A2B3C]">No bookings yet</p>
        <p className="mt-1 text-xs text-[#607181]">Your appointment history will show up here.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {bookings.map((b) => {
        const date = new Date(b.scheduled_at);
        const dateStr = date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
        const doctorName = b.doctor_profiles?.profiles?.full_name ?? 'Unknown Doctor';
        const clinicName = b.doctor_profiles?.clinic_name ?? '';

        return (
          <div key={b.id} className="rounded-2xl border border-[#e5ebed] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0D6E6E]/10 text-[#0D6E6E]">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A2B3C]">{doctorName}</p>
                  {clinicName && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-[#607181]">
                      <MapPin size={11} /> {clinicName}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-[#607181]">{b.service_type}</p>
                  {b.reason_for_visit && (
                    <p className="mt-0.5 text-xs italic text-[#9aa8b0]">"{b.reason_for_visit}"</p>
                  )}
                </div>
              </div>

              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[b.status]}`}>
                {STATUS_LABELS[b.status]}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-1.5 border-t border-[#f0f3f5] pt-3 text-xs text-[#607181]">
              <CalendarClock size={13} />
              {dateStr} &middot; {timeStr} &middot; {b.duration_minutes} min
            </div>
          </div>
        );
      })}
    </div>
  );
}