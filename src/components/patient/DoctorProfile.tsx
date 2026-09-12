import { useEffect, useState } from 'react';
import { DoctorProfile as DoctorProfileRecord, fetchDoctor } from '../../lib/live-data';
import { formatPHP } from '../../lib/currency';
import {
  ArrowLeft,
  Star,
  MapPin,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Languages,
  CreditCard,
  HeartPulse,
  Stethoscope,
  Clock3,
  BadgeCheck,
  AlertCircle,
} from 'lucide-react';

interface DoctorProfileProps {
  doctorId: string;
  onBack: () => void;
  onBookAppointment: (doctorId: string) => void;
}

/* ── Avatar color palette (same as PatientPortalHome) ────────────── */
const avatarColors = [
  '#0D6E6E',
  '#FF6B6B',
  '#3B82F6',
  '#8B5CF6',
  '#F59E0B',
  '#10B981',
];
function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

/* ── Payment method display labels ───────────────────────────────── */
const paymentLabel: Record<string, string> = {
  cash: 'Cash',
  card: 'Credit / Debit Card',
  gcash: 'GCash',
  maya: 'Maya',
  bank_transfer: 'Bank Transfer',
  insurance: 'Insurance',
};

export default function DoctorProfile({ doctorId, onBack, onBookAppointment }: DoctorProfileProps) {
  const [doctor, setDoctor] = useState<DoctorProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctor(doctorId)
      .then(setDoctor)
      .finally(() => setLoading(false));
  }, [doctorId]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F8FAFB] text-sm text-[#607181]">Loading doctor profile...</div>;
  }

  /* ── Not found ───────────────────────────────────────────────── */
  if (!doctor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFB] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#e5ebed] bg-white p-8 text-center shadow-sm">
          <AlertCircle size={40} className="mx-auto mb-3 text-[#FF6B6B]" />
          <h2 className="text-lg font-bold text-[#1A2B3C]">Doctor not found</h2>
          <p className="mt-2 text-sm text-[#607181]">
            The doctor you are looking for does not exist or may have been removed.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-6 rounded-xl bg-[#0D6E6E] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#095a5a]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const licenseExpiry = new Date(doctor.prcLicenseExpiry);
  const licenseValid = licenseExpiry > new Date();

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e5ebed]">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium text-[#607181] hover:text-[#0D6E6E]"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* ── Header card ────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#e5ebed] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* large avatar */}
            <div
              className="grid h-20 w-20 shrink-0 place-items-center rounded-full text-xl font-bold text-white"
              style={{ backgroundColor: avatarColor(doctor.id) }}
            >
              {doctor.initials}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-bold text-[#1A2B3C]">{doctor.fullName}</h1>

              {/* specialties */}
              <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                {doctor.specialties.map((s) => (
                  <span
                    key={s}
                    className="inline-block rounded-md bg-[#e5f4f3] px-2.5 py-0.5 text-xs font-semibold text-[#0D6E6E]"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* clinic */}
              <p className="mt-3 text-sm font-medium text-[#1A2B3C]">{doctor.clinicName}</p>
              <div className="mt-0.5 flex items-center justify-center gap-1 text-xs text-[#607181] sm:justify-start">
                <MapPin size={12} className="shrink-0" />
                {doctor.clinicAddress}, {doctor.city}, {doctor.province}
              </div>

              {/* rating */}
              <div className="mt-3 flex items-center justify-center gap-1.5 sm:justify-start">
                <Star size={14} className="fill-[#F59E0B] text-[#F59E0B]" />
                <span className="text-sm font-bold text-[#1A2B3C]">{doctor.rating.toFixed(1)}</span>
                <span className="text-xs text-[#607181]">({doctor.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Credentials ────────────────────────────────────── */}
        <Section title="Credentials" icon={ShieldCheck}>
          <InfoRow label="Medical Degree" value={doctor.medicalDegree} />
          <InfoRow label="PRC License Number" value={doctor.prcLicenseNumber} />
          <InfoRow
            label="PRC License Expiry"
            value={licenseExpiry.toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          />
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-[#607181]">PRC Verification</span>
            {doctor.prcLicenseVerified && licenseValid ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                <BadgeCheck size={12} />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-[11px] font-semibold text-yellow-700">
                Unverified
              </span>
            )}
          </div>
          {doctor.boardCertifications.length > 0 && (
            <div className="pt-2">
              <span className="text-xs text-[#607181]">Board Certifications</span>
              <ul className="mt-1.5 space-y-1">
                {doctor.boardCertifications.map((cert) => (
                  <li
                    key={cert}
                    className="flex items-start gap-1.5 text-xs text-[#1A2B3C]"
                  >
                    <GraduationCap size={12} className="mt-0.5 shrink-0 text-[#0D6E6E]" />
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        {/* ── About ──────────────────────────────────────────── */}
        <Section title="About" icon={Stethoscope}>
          <p className="text-sm leading-relaxed text-[#1A2B3C]">{doctor.bio}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniStat
              icon={Briefcase}
              label="Experience"
              value={`${doctor.yearsOfExperience} years`}
            />
            <MiniStat
              icon={Languages}
              label="Languages"
              value={doctor.languages.join(', ')}
            />
          </div>
        </Section>

        {/* ── Accepted Payment Methods ───────────────────────── */}
        <Section title="Accepted Payment Methods" icon={CreditCard}>
          <div className="flex flex-wrap gap-2">
            {doctor.acceptedPaymentMethods.map((m) => (
              <span
                key={m}
                className="rounded-full border border-[#dce8e8] bg-[#f8fafb] px-3 py-1 text-xs font-medium text-[#1A2B3C]"
              >
                {paymentLabel[m] || m}
              </span>
            ))}
          </div>
        </Section>

        {/* ── Accepted HMOs / Insurance ──────────────────────── */}
        <Section title="Accepted HMOs / Insurance" icon={HeartPulse}>
          <div className="flex flex-wrap gap-2">
            {doctor.acceptedHmos.map((h) => (
              <span
                key={h}
                className="rounded-full border border-[#dce8e8] bg-[#f8fafb] px-3 py-1 text-xs font-medium text-[#1A2B3C]"
              >
                {h}
              </span>
            ))}
          </div>
        </Section>

        {/* ── Consultation Fee ───────────────────────────────── */}
        <Section title="Consultation Fee" icon={Clock3}>
          <p className="text-2xl font-bold text-[#0D6E6E]">
            {formatPHP(doctor.consultationFeeCents)}
          </p>
          <p className="mt-1 text-xs text-[#607181]">Per consultation visit</p>
        </Section>

        {/* ── Book button ────────────────────────────────────── */}
        <div className="mt-6 pb-8">
          <button
            type="button"
            onClick={() => onBookAppointment(doctorId)}
            className="w-full rounded-xl bg-[#0D6E6E] py-3 text-sm font-bold text-white shadow-[0_6px_16px_rgba(13,110,110,0.2)] transition hover:bg-[#095a5a]"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable section wrapper ────────────────────────────────────── */
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-[#e5ebed] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={16} className="text-[#0D6E6E]" />
        <h2 className="text-sm font-bold text-[#1A2B3C]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ── Info row (label : value) ────────────────────────────────────── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f0f3f5] py-2 last:border-0">
      <span className="text-xs text-[#607181]">{label}</span>
      <span className="text-xs font-medium text-[#1A2B3C]">{value}</span>
    </div>
  );
}

/* ── Mini stat block ─────────────────────────────────────────────── */
function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#f8fafb] border border-[#e5ebed] p-3">
      <div className="flex items-center gap-1.5 text-[#607181]">
        <Icon size={12} />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-xs font-semibold text-[#1A2B3C]">{value}</p>
    </div>
  );
}
