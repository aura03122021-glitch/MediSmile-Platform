import { supabase } from './supabase';
const PH_OFFSET_HOURS = 8;

export function phTimeToUtcIso(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const utcMs = Date.UTC(year, month - 1, day, hour - PH_OFFSET_HOURS, minute, 0);
  return new Date(utcMs).toISOString();
}

export function utcToPhParts(isoString: string): { date: string; time: string } {
  const d = new Date(isoString);
  const phMs = d.getTime() + PH_OFFSET_HOURS * 60 * 60 * 1000;
  const phDate = new Date(phMs);
  const date = phDate.toISOString().slice(0, 10);
  const time = phDate.toISOString().slice(11, 16);
  return { date, time };
}
export function sortAppointmentsForDisplay<T extends { scheduled_at: string; status: string }>(rows: T[]): T[] {
  const upcoming = rows.filter((r) => r.status === 'pending' || r.status === 'confirmed');
  const past = rows.filter((r) => r.status !== 'pending' && r.status !== 'confirmed');

  upcoming.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  past.sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  return [...upcoming, ...past];
}

export function formatBookedOn(isoString: string): string {
  const { dateStr } = formatPhDateTime(isoString);
  return dateStr;
}
export function formatPhDateTime(isoString: string): { dateStr: string; timeStr: string } {

  const { date, time } = utcToPhParts(isoString);
  const d = new Date(`${date}T${time}:00Z`);
  const dateStr = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const timeStr = d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' });
  return { dateStr, timeStr };
}
export type DayHours = { enabled: boolean; start: string; end: string };
export type WorkingHours = {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
};

export type DoctorProfile = {
  id: string;
  fullName: string;
  initials: string;
  specialties: string[];
  bio: string;
  clinicName: string;
  clinicAddress: string;
  city: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  prcLicenseNumber: string;
  prcLicenseExpiry: string;
  prcLicenseVerified: boolean;
  medicalDegree: string;
  boardCertifications: string[];
  yearsOfExperience: number;
  languages: string[];
  acceptedPaymentMethods: string[];
  acceptedHmos: string[];
  consultationFeeCents: number;
  rating: number;
  reviewCount: number;
  isAcceptingPatients: boolean;
  workingHours: WorkingHours;
};

export type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  patientName: string;
  service: string;
  date: string;
  amountCents: number;
  status: string;
};

export type PendingDoctor = {
  id: string;
  profileId: string;
  name: string;
  email: string;
  specialty: string;
  prcLicense: string;
  medicalDegree: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type DashboardStats = {
  totalPatients: number;
  activeDoctors: number;
  appointmentsThisMonth: number;
  revenueCents: number;
  monthlyRevenue: { month: string; value: number }[];
};

export type SubscriptionTier = {
  id: string;
  name: string;
  priceCents: number;
  description: string;
  features: string[];
  maxPractitioners: number | null;
  isHighlighted: boolean;
};

export type UserTarget = { id: string; name: string; email: string; role: 'patient' | 'subscriber'; status: 'approved' | 'pending' | 'rejected' | 'suspended' };

export async function fetchAdminStats(): Promise<DashboardStats> {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const [patients, doctors, appointments, invoices] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('doctor_profiles').select('id', { count: 'exact', head: true }).eq('is_accepting_patients', true),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).gte('scheduled_at', start.toISOString()),
    supabase.from('invoices').select('total_cents, paid_at').eq('status', 'paid').gte('paid_at', start.toISOString()),
  ]);
  const error = [patients, doctors, appointments, invoices].find((result) => result.error)?.error;
  if (error) throw error;
  const paidRows = (invoices.data ?? []) as { total_cents: number; paid_at: string }[];
  return {
    totalPatients: patients.count ?? 0,
    activeDoctors: doctors.count ?? 0,
    appointmentsThisMonth: appointments.count ?? 0,
    revenueCents: paidRows.reduce((sum, row) => sum + row.total_cents, 0),
    monthlyRevenue: paidRows.reduce((months, row) => {
      const month = new Date(row.paid_at).toLocaleDateString('en-PH', { month: 'short' });
      const existing = months.find((item) => item.month === month);
      if (existing) existing.value += row.total_cents;
      else months.push({ month, value: row.total_cents });
      return months;
    }, [] as { month: string; value: number }[]),
  };
}

export async function fetchPendingDoctors(): Promise<PendingDoctor[]> {
  const { data, error } = await supabase.from('profiles').select('id, full_name, email, status, created_at, doctor_profiles!inner(id, specialties, prc_license_number, medical_degree)').eq('role', 'subscriber').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const doctor = (row.doctor_profiles as unknown as Record<string, unknown>);
    return { id: String(doctor.id), profileId: String(row.id), name: String(row.full_name), email: String(row.email), specialty: ((doctor.specialties as string[]) ?? []).join(', ') || 'Not specified', prcLicense: String(doctor.prc_license_number ?? ''), medicalDegree: String(doctor.medical_degree ?? ''), submittedDate: new Date(String(row.created_at)).toLocaleDateString('en-PH'), status: row.status as PendingDoctor['status'] };
  });
}

export async function updateProfileStatus(profileId: string, status: PendingDoctor['status']) {
  const { error } = await supabase.from('profiles').update({ status }).eq('id', profileId);
  if (error) throw error;
}

export async function fetchUserTargets(): Promise<UserTarget[]> {
  const { data, error } = await supabase.from('profiles').select('id, full_name, email, role, status').in('role', ['patient', 'subscriber']).order('full_name');
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id, name: row.full_name, email: row.email, role: row.role as UserTarget['role'], status: row.status as UserTarget['status'] }));
}

export async function fetchSubscriptionTiers(): Promise<SubscriptionTier[]> {
  const { data, error } = await supabase.from('subscription_tiers').select('id, name, price_cents, description, features, max_practitioners, is_highlighted').eq('is_active', true).order('sort_order');
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id, name: row.name, priceCents: row.price_cents, description: row.description ?? '', features: row.features ?? [], maxPractitioners: row.max_practitioners, isHighlighted: row.is_highlighted }));
}

export async function updateSubscriptionTier(id: string, values: Pick<SubscriptionTier, 'name' | 'priceCents' | 'description'>) {
  const { error } = await supabase.from('subscription_tiers').update({ name: values.name, price_cents: values.priceCents, description: values.description }).eq('id', id);
  if (error) throw error;
}

export async function fetchDoctorPatients(doctorProfileId: string) {
  const { data: doctor, error: doctorError } = await supabase.from('doctor_profiles').select('id').eq('profile_id', doctorProfileId).single();
  if (doctorError) throw doctorError;
  const { data, error } = await supabase.from('appointments').select('patient:profiles!appointments_patient_id_fkey(id, full_name, email), scheduled_at').eq('doctor_id', doctor.id).order('scheduled_at', { ascending: false });
  if (error) throw error;
  const patients = new Map<string, { id: string; name: string; email: string; last: string; initials: string }>();
  (data ?? []).forEach((row) => { const patient = row.patient as unknown as { id: string; full_name: string; email: string }; if (!patient || patients.has(patient.id)) return; patients.set(patient.id, { id: patient.id, name: patient.full_name, email: patient.email, last: new Date(row.scheduled_at).toLocaleDateString('en-PH'), initials: initials(patient.full_name) }); });
  return Array.from(patients.values());
}

function initials(name: string): string {
  return name
    .replace(/^Dr\.\s*/i, '')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { enabled: true, start: '09:00', end: '17:00' },
  tuesday: { enabled: true, start: '09:00', end: '17:00' },
  wednesday: { enabled: true, start: '09:00', end: '17:00' },
  thursday: { enabled: true, start: '09:00', end: '17:00' },
  friday: { enabled: true, start: '09:00', end: '17:00' },
  saturday: { enabled: true, start: '09:00', end: '12:00' },
  sunday: { enabled: false, start: '09:00', end: '17:00' },
};

function mapDoctor(row: Record<string, unknown>): DoctorProfile {
  const profile = row.profile as Record<string, unknown> | null;
  const fullName = String(profile?.full_name ?? row.full_name ?? 'Doctor');
  return {
    id: String(row.id),
    fullName,
    initials: initials(fullName),
    specialties: (row.specialties as string[]) ?? [],
    bio: String(row.bio ?? ''),
    clinicName: String(row.clinic_name ?? ''),
    clinicAddress: String(row.clinic_address ?? ''),
    city: String(row.city ?? ''),
    province: String(row.province ?? ''),
    latitude: row.latitude as number | null,
    longitude: row.longitude as number | null,
    prcLicenseNumber: String(row.prc_license_number ?? ''),
    prcLicenseExpiry: String(row.prc_license_expiry ?? ''),
    prcLicenseVerified: Boolean(row.prc_license_verified),
    medicalDegree: String(row.medical_degree ?? ''),
    boardCertifications: (row.board_certifications as string[]) ?? [],
    yearsOfExperience: Number(row.years_of_experience ?? 0),
    languages: (row.languages as string[]) ?? [],
    acceptedPaymentMethods: (row.accepted_payment_methods as string[]) ?? [],
    acceptedHmos: (row.accepted_hmos as string[]) ?? [],
    consultationFeeCents: Number(row.consultation_fee_cents ?? 0),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    isAcceptingPatients: Boolean(row.is_accepting_patients),
    workingHours: (row.working_hours as WorkingHours) ?? DEFAULT_WORKING_HOURS,
  };
}

export async function fetchDoctors(): Promise<DoctorProfile[]> {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select('*, profile:profiles!doctor_profiles_profile_id_fkey!inner(full_name, status)')
    .eq('is_accepting_patients', true)
    .eq('profile.status', 'approved')
    .order('rating', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapDoctor(row as Record<string, unknown>));
}

export async function fetchDoctor(id: string): Promise<DoctorProfile | null> {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select('*, profile:profiles!doctor_profiles_profile_id_fkey!inner(full_name, status)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapDoctor(data as Record<string, unknown>) : null;
}

export async function fetchDoctorByProfileId(profileId: string): Promise<DoctorProfile | null> {
  const { data, error } = await supabase.from('doctor_profiles').select('*, profile:profiles!doctor_profiles_profile_id_fkey(full_name, status)').eq('profile_id', profileId).maybeSingle();
  if (error) throw error;
  return data ? mapDoctor(data as Record<string, unknown>) : null;
}

export interface DoctorProfileUpdateInput {
  specialties: string[];
  bio: string;
  clinicName: string;
  clinicAddress: string;
  city: string;
  province: string;
  prcLicenseNumber: string;
  medicalDegree: string;
  yearsOfExperience: number;
  languages: string[];
  acceptedPaymentMethods: string[];
  acceptedHmos: string[];
  consultationFeeCents: number;
  workingHours?: WorkingHours;
}

export async function updateMyDoctorProfile(profileId: string, input: DoctorProfileUpdateInput) {
  const { error } = await supabase.from('doctor_profiles').update({
    specialties: input.specialties,
    bio: input.bio,
    clinic_name: input.clinicName,
    clinic_address: input.clinicAddress,
    city: input.city,
    province: input.province,
    prc_license_number: input.prcLicenseNumber,
    medical_degree: input.medicalDegree,
    years_of_experience: input.yearsOfExperience,
    languages: input.languages,
    accepted_payment_methods: input.acceptedPaymentMethods,
    accepted_hmos: input.acceptedHmos,
    consultation_fee_cents: input.consultationFeeCents,
    ...(input.workingHours ? { working_hours: input.workingHours } : {}),
  }).eq('profile_id', profileId);
  if (error) throw error;
}

export async function createAppointment(input: {
  patientId: string;
  doctorId: string;
  serviceType: string;
  scheduledAt: string;
  durationMinutes?: number;
  reasonForVisit?: string;
}) {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: input.patientId,
      doctor_id: input.doctorId,
      service_type: input.serviceType,
      scheduled_at: input.scheduledAt,
      duration_minutes: input.durationMinutes ?? 30,
      reason_for_visit: input.reasonForVisit || null,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchInvoices(): Promise<InvoiceRecord[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, service_description, total_cents, status, created_at, patient:profiles!invoices_patient_id_fkey(full_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const item = row as Record<string, unknown>;
    const patient = item.patient as Record<string, unknown> | null;
    return {
      id: String(item.id),
      invoiceNumber: String(item.invoice_number),
      patientName: String(patient?.full_name ?? 'Patient'),
      service: String(item.service_description),
      date: String(item.created_at),
      amountCents: Number(item.total_cents),
      status: String(item.status),
    };
  });
}

export async function updateInvoiceStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('invoices')
    .update({ status, paid_at: status === 'paid' ? new Date().toISOString() : null })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function fetchDoctorAvailability(doctorId: string, date: string): Promise<{ workingHours: WorkingHours; bookedSlots: { start: string; end: string }[] }> {
  const { data: doctor, error: doctorError } = await supabase
    .from('doctor_profiles')
    .select('working_hours')
    .eq('id', doctorId)
    .single();
  if (doctorError) throw doctorError;

  const dayStart = `${date}T00:00:00`;
  const dayEnd = `${date}T23:59:59`;

  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('scheduled_at, duration_minutes')
    .eq('doctor_id', doctorId)
    .gte('scheduled_at', dayStart)
    .lte('scheduled_at', dayEnd)
    .in('status', ['pending', 'confirmed']);
  if (apptError) throw apptError;

  const bookedSlots = (appointments ?? []).map((a) => {
    const startParts = utcToPhParts(a.scheduled_at);
    const start = new Date(`${startParts.date}T${startParts.time}:00Z`);
    const end = new Date(start.getTime() + a.duration_minutes * 60000);
    return {
      start: startParts.time,
      end: end.toISOString().slice(11, 16),
    };
  });

  return {
    workingHours: (doctor.working_hours as WorkingHours) ?? DEFAULT_WORKING_HOURS,
    bookedSlots,
  };
}