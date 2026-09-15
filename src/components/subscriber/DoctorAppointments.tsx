import { useState, useEffect, useMemo } from 'react';
import { CalendarClock, User, Save, Pencil, X, ChevronLeft, ChevronRight, ChevronDown, Phone, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';
import { phTimeToUtcIso, utcToPhParts, formatPhDateTime, formatBookedOn, WorkingHours } from '../../lib/live-data';

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

interface AppointmentRow {
  id: string;
  scheduled_at: string;
  created_at: string;
  duration_minutes: number;
  service_type: string;
  reason_for_visit: string | null;
  notes: string | null;
  status: AppointmentStatus;
  patient: {
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
}

const STATUS_OPTIONS: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

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

const DAY_KEYS: (keyof WorkingHours)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDates(ref: Date): Date[] {
  const day = ref.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DoctorAppointments() {
  const { activeUser } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [weekRef, setWeekRef] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!activeUser) return;
    loadAppointments();
  }, [activeUser]);

  async function loadAppointments() {
    setLoading(true);
    setError(null);

    const { data: doctorProfile, error: doctorError } = await supabase
      .from('doctor_profiles')
      .select('id, working_hours')
      .eq('profile_id', activeUser!.id)
      .single();

    if (doctorError || !doctorProfile) {
      setError('Could not find your doctor profile.');
      setLoading(false);
      return;
    }

    setWorkingHours(doctorProfile.working_hours as WorkingHours);

    const { data, error: apptError } = await supabase
      .from('appointments')
      .select(`
        id,
        scheduled_at,
        created_at,
        duration_minutes,
        service_type,
        reason_for_visit,
        notes,
        status,
        patient:profiles!appointments_patient_id_fkey (full_name, email, phone)
      `)
      .eq('doctor_id', doctorProfile.id)
      .order('scheduled_at', { ascending: true });

    if (apptError) {
      setError('Could not load appointments.');
    } else {
      const rows = (data as unknown as AppointmentRow[]) ?? [];
      setAppointments(rows);
      const drafts: Record<string, string> = {};
      rows.forEach((r) => { drafts[r.id] = r.notes ?? ''; });
      setNotesDraft(drafts);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    setSavingId(id);
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (!error) {
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    }
    setSavingId(null);
  }

  async function saveNotes(id: string) {
    setSavingId(id);
    const notes = notesDraft[id]?.trim() || null;
    const { error } = await supabase.from('appointments').update({ notes }).eq('id', id);
    if (!error) {
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, notes } : a)));
    }
    setSavingId(null);
  }

  function startReschedule(a: AppointmentRow) {
    const { date, time } = utcToPhParts(a.scheduled_at);
    setEditDate(date);
    setEditTime(time);
    setEditingId(a.id);
  }

  async function saveReschedule(id: string) {
    if (!editDate || !editTime) return;
    setSavingId(id);
    const scheduledAt = phTimeToUtcIso(editDate, editTime);
    const { error } = await supabase.from('appointments').update({ scheduled_at: scheduledAt }).eq('id', id);
    if (!error) {
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, scheduled_at: scheduledAt } : a)));
      setEditingId(null);
    }
    setSavingId(null);
  }

  const weekDates = useMemo(() => getWeekDates(weekRef), [weekRef]);

  const countsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    appointments.forEach((a) => {
      const { date } = utcToPhParts(a.scheduled_at);
      map[date] = (map[date] ?? 0) + 1;
    });
    return map;
  }, [appointments]);

  const visibleAppointments = useMemo(() => {
    if (!selectedDate) {
      const upcoming = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed');
      const past = appointments.filter((a) => a.status !== 'pending' && a.status !== 'confirmed');
      upcoming.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
      past.sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
      return [...upcoming, ...past];
    }
    return appointments
      .filter((a) => utcToPhParts(a.scheduled_at).date === selectedDate)
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  }, [appointments, selectedDate]);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#0D6E6E] border-t-transparent" />
          <p className="mt-3 text-sm text-[#607181]">Loading appointments...</p>
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

  const weekLabel = `${weekDates[0].toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} – ${weekDates[6].toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* LEFT: Week calendar */}
        <div className="rounded-2xl border border-[#e5ebed] bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] lg:sticky lg:top-4 lg:self-start">
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => setWeekRef((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })} className="rounded-lg p-1.5 text-[#607181] hover:bg-[#f8fafb]">
              <ChevronLeft size={16} />
            </button>
            <p className="text-xs font-semibold text-[#1A2B3C]">{weekLabel}</p>
            <button onClick={() => setWeekRef((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })} className="rounded-lg p-1.5 text-[#607181] hover:bg-[#f8fafb]">
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => { setWeekRef(new Date()); setSelectedDate(null); }}
            className="mb-3 w-full rounded-lg border border-[#dce8e8] py-1.5 text-xs font-semibold text-[#0D6E6E] hover:bg-[#f2fafa]"
          >
            Today · Show All
          </button>

          <div className="space-y-1.5">
            {weekDates.map((d) => {
              const dateKey = toDateKey(d);
              const dayKey = DAY_KEYS[d.getDay()];
              const isWorking = workingHours?.[dayKey]?.enabled ?? true;
              const count = countsByDate[dateKey] ?? 0;
              const isSelected = selectedDate === dateKey;
              const isToday = dateKey === toDateKey(new Date());

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate((prev) => (prev === dateKey ? null : dateKey))}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                    isSelected ? 'bg-[#0D6E6E] text-white' : isWorking ? 'hover:bg-[#f2fafa]' : 'opacity-50 hover:bg-[#f8fafb]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-bold ${
                      isSelected ? 'bg-white/20 text-white' : isToday ? 'bg-[#0D6E6E] text-white' : 'bg-[#f2fafa] text-[#1A2B3C]'
                    }`}>
                      {d.getDate()}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-[#1A2B3C]'}`}>{DAY_LABELS[d.getDay()]}</p>
                      {!isWorking && <p className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[#9aa8b0]'}`}>Off</p>}
                    </div>
                  </div>
                  {count > 0 && (
                    <span className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[10px] font-bold ${
                      isSelected ? 'bg-white text-[#0D6E6E]' : 'bg-[#0D6E6E] text-white'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Appointment list */}
        <div className="space-y-2">
          {selectedDate && (
            <p className="px-1 text-xs font-semibold text-[#607181]">
              Showing {visibleAppointments.length} appointment{visibleAppointments.length !== 1 && 's'} for {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-PH', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          )}

          {visibleAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e5ebed] bg-white py-16 text-center">
              <CalendarClock size={40} className="mb-3 text-[#dce8e8]" />
              <p className="text-sm font-semibold text-[#1A2B3C]">No appointments</p>
              <p className="mt-1 text-xs text-[#607181]">{selectedDate ? 'Nothing scheduled for this day.' : 'Patient bookings will show up here.'}</p>
            </div>
          ) : (
            visibleAppointments.map((a) => {
              const { dateStr, timeStr } = formatPhDateTime(a.scheduled_at);
              const isExpanded = expandedId === a.id;
              const isEditing = editingId === a.id;
              const isSaving = savingId === a.id;

              return (
                <div key={a.id} className="overflow-hidden rounded-2xl border border-[#e5ebed] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                  <button
                    onClick={() => toggleExpand(a.id)}
                    className="flex w-full items-center gap-3 border-l-4 border-[#0D6E6E] px-4 py-3 text-left transition hover:bg-[#f8fafb]"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0D6E6E]/10 text-[#0D6E6E]">
                      <User size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#1A2B3C]">{a.patient?.full_name ?? 'Unknown Patient'}</p>
                      <p className="text-xs text-[#607181]">{selectedDate ? timeStr : `${dateStr} · ${timeStr}`}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[a.status]}`}>
                      {STATUS_LABELS[a.status]}
                    </span>
                    <ChevronDown size={16} className={`shrink-0 text-[#9aa8b0] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#f0f3f5] px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-0.5 text-xs text-[#607181]">
                          {a.patient?.email && <p className="flex items-center gap-1.5"><Mail size={12} /> {a.patient.email}</p>}
                          {a.patient?.phone && <p className="flex items-center gap-1.5"><Phone size={12} /> {a.patient.phone}</p>}
                        </div>
                        <select
                          value={a.status}
                          disabled={isSaving}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateStatus(a.id, e.target.value as AppointmentStatus)}
                          className={`rounded-full border-none px-3 py-1 text-xs font-semibold ${STATUS_STYLES[a.status]}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </div>

                      <p className="mt-3 text-xs text-[#607181]">{a.service_type}</p>
                      {a.reason_for_visit && <p className="mt-0.5 text-xs italic text-[#9aa8b0]">"{a.reason_for_visit}"</p>}

                      <div className="mt-3 border-t border-[#f0f3f5] pt-3">
                        {isEditing ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="rounded-lg border border-[#dce8e8] px-2.5 py-1.5 text-xs" />
                            <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="rounded-lg border border-[#dce8e8] px-2.5 py-1.5 text-xs" />
                            <button onClick={() => saveReschedule(a.id)} disabled={isSaving} className="flex items-center gap-1 rounded-lg bg-[#0D6E6E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#095a5a] disabled:opacity-50">
                              <Save size={12} /> Save
                            </button>
                            <button onClick={() => setEditingId(null)} className="flex items-center gap-1 rounded-lg border border-[#dce8e8] px-3 py-1.5 text-xs font-semibold text-[#607181] hover:bg-[#f8fafb]">
                              <X size={12} /> Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs text-[#607181]">
                            <span className="flex items-center gap-1.5">
                              <CalendarClock size={13} /> {dateStr} &middot; {timeStr} &middot; {a.duration_minutes} min
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-[#9aa8b0]">Booked on {formatBookedOn(a.created_at)}</span>
                              <button onClick={() => startReschedule(a)} className="flex items-center gap-1 text-xs font-semibold text-[#0D6E6E] hover:underline">
                                <Pencil size={12} /> Reschedule
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 border-t border-[#f0f3f5] pt-3">
                        <label className="mb-1 block text-[11px] font-semibold text-[#1A2B3C]">Doctor Notes</label>
                        <textarea
                          value={notesDraft[a.id] ?? ''}
                          onChange={(e) => setNotesDraft((prev) => ({ ...prev, [a.id]: e.target.value }))}
                          rows={2}
                          placeholder="Add private notes about this appointment..."
                          className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-xs text-[#1A2B3C] placeholder:text-[#9aa8b0] focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20"
                        />
                        <button
                          onClick={() => saveNotes(a.id)}
                          disabled={isSaving || notesDraft[a.id] === (a.notes ?? '')}
                          className="mt-1.5 flex items-center gap-1 rounded-lg bg-[#0D6E6E]/10 px-2.5 py-1 text-[11px] font-semibold text-[#0D6E6E] hover:bg-[#0D6E6E]/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Save size={11} /> Save Notes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}