import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Check, Clock3, Stethoscope, UserRound } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { createAppointment, DoctorProfile, fetchDoctors, fetchDoctorAvailability, WorkingHours, phTimeToUtcIso } from '../../lib/live-data';

const services = ['Dental Care', 'General Medicine', 'Specialist Consultation'];
const APPOINTMENT_DURATION_MIN = 30;
const SLOT_STEP_MIN = 15;

const DAY_KEYS: (keyof WorkingHours)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function toTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function AppointmentBooking({ doctorId }: { doctorId?: string }) {
  const { activeUser } = useAuth();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [service, setService] = useState(services[0]);
  const [selectedDoctor, setSelectedDoctor] = useState(doctorId ?? '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [availability, setAvailability] = useState<{ workingHours: WorkingHours; bookedSlots: { start: string; end: string }[] } | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchDoctors().then((loadedDoctors) => {
      setDoctors(loadedDoctors);
      if (!selectedDoctor && loadedDoctors[0]) setSelectedDoctor(loadedDoctors[0].id);
    }).catch((error: Error) => setMessage(error.message));
  }, [doctorId]);

  useEffect(() => {
    if (!selectedDoctor || !date) return;
    setLoadingSlots(true);
    setTime('');
    fetchDoctorAvailability(selectedDoctor, date)
      .then(setAvailability)
      .catch(() => setAvailability(null))
      .finally(() => setLoadingSlots(false));
  }, [selectedDoctor, date]);

  const slots = useMemo(() => {
    if (!availability) return [];
    const dayKey = DAY_KEYS[new Date(`${date}T00:00:00`).getDay()];
    const dayHours = availability.workingHours[dayKey];
    if (!dayHours.enabled) return [];

    const startMin = toMinutes(dayHours.start);
    const endMin = toMinutes(dayHours.end);
    const result: { time: string; available: boolean }[] = [];

    for (let t = startMin; t + APPOINTMENT_DURATION_MIN <= endMin; t += SLOT_STEP_MIN) {
      const slotStart = t;
      const slotEnd = t + APPOINTMENT_DURATION_MIN;
      const overlaps = availability.bookedSlots.some((b) => {
        const bStart = toMinutes(b.start);
        const bEnd = toMinutes(b.end);
        return slotStart < bEnd && slotEnd > bStart;
      });
      result.push({ time: toTimeString(t), available: !overlaps });
    }
    return result;
  }, [availability, date]);

  async function submitBooking(event: FormEvent) {
    event.preventDefault();
    if (!activeUser || activeUser.role !== 'patient') {
      setMessage('Sign in as a patient to book an appointment.');
      return;
    }
    if (!selectedDoctor) {
      setMessage('Choose a doctor before booking.');
      return;
    }
    if (!time) {
      setMessage('Choose an available time slot.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await createAppointment({ patientId: activeUser.id, doctorId: selectedDoctor, serviceType: service, scheduledAt: phTimeToUtcIso(date, time), durationMinutes: APPOINTMENT_DURATION_MIN, reasonForVisit: reason });
      setMessage('Appointment request submitted.');
      setTime('');
      fetchDoctorAvailability(selectedDoctor, date).then(setAvailability);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to book appointment.');
    } finally {
      setSaving(false);
    }
  }

  const doctor = doctors.find((item) => item.id === selectedDoctor);

  return <div className="mx-auto max-w-3xl px-6 py-8 text-[#1A2B3C]">
    <header className="mb-8"><p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#0D6E6E]">Your care, on your time</p><h1 className="text-4xl font-bold tracking-[-0.05em]">Book an Appointment</h1><p className="mt-3 text-base text-[#687b87]">Choose a doctor, time, and service. Your request will be saved to your account.</p></header>
    <form onSubmit={submitBooking} className="space-y-5">
      <section className="rounded-2xl border border-[#e7eeee] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.07)]"><h2 className="mb-5 text-xl font-bold">Appointment details</h2>
        <label className="block text-sm font-semibold">Service<select value={service} onChange={(event) => setService(event.target.value)} className="mt-2 w-full rounded-lg border border-[#dfe8e8] bg-white px-3 py-2.5 text-sm">{services.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="mt-4 block text-sm font-semibold">Doctor<select value={selectedDoctor} onChange={(event) => setSelectedDoctor(event.target.value)} className="mt-2 w-full rounded-lg border border-[#dfe8e8] bg-white px-3 py-2.5 text-sm">{doctors.map((item) => <option key={item.id} value={item.id}>{item.fullName} · {item.specialties.join(', ')}</option>)}</select></label>
        {doctor && <p className="mt-2 text-xs text-[#607181]">Consultation fee: ₱{(doctor.consultationFeeCents / 100).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>}
        <label className="mt-4 block text-sm font-semibold">Date<input type="date" required value={date} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full rounded-lg border border-[#dfe8e8] px-3 py-2.5 text-sm" /></label>

        <div className="mt-4">
          <p className="text-sm font-semibold">Time</p>
          {loadingSlots ? (
            <p className="mt-2 text-xs text-[#607181]">Loading available times...</p>
          ) : slots.length === 0 ? (
            <p className="mt-2 text-xs text-[#607181]">Doctor is not available on this day. Please choose another date.</p>
          ) : (
            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {slots.map((s) => (
                <button
                  type="button"
                  key={s.time}
                  disabled={!s.available}
                  onClick={() => setTime(s.time)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                    !s.available
                      ? 'cursor-not-allowed border-[#e5ebed] bg-[#f4f6f7] text-[#c3ccd1] line-through'
                      : time === s.time
                      ? 'border-[#0D6E6E] bg-[#0D6E6E] text-white'
                      : 'border-[#dfe8e8] bg-white text-[#1A2B3C] hover:border-[#0D6E6E]'
                  }`}
                >
                  {s.time}
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="mt-4 block text-sm font-semibold">Reason for visit<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-[#dfe8e8] p-3 text-sm" placeholder="Tell the clinic what you need help with" /></label>
      </section>
      <section className="rounded-2xl border border-[#e1eded] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.07)]"><h2 className="text-xl font-bold">Summary</h2><div className="my-5 space-y-3 text-sm"><p><Stethoscope size={16} className="mr-2 inline text-[#0D6E6E]" />{service}</p><p><UserRound size={16} className="mr-2 inline text-[#0D6E6E]" />{doctor?.fullName ?? 'Choose a doctor'}</p><p><CalendarDays size={16} className="mr-2 inline text-[#0D6E6E]" />{date}</p><p><Clock3 size={16} className="mr-2 inline text-[#0D6E6E]" />{time || 'Choose a time'}</p></div><button disabled={saving || doctors.length === 0 || !time} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0D6E6E] px-4 py-3.5 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Submitting...' : 'Confirm Booking'}{saving ? <Check size={16} /> : <ArrowRight size={16} />}</button>{message && <p className="mt-4 text-center text-sm text-[#0D6E6E]">{message}</p>}</section>
    </form>
  </div>;
}