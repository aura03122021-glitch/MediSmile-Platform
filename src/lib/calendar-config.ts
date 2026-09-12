/**
 * Interface mapping the exact 11 columns from your live appointments table
 */
export interface SupabaseAppointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  service_type: string;
  scheduled_at: string; // timestamp with time zone string
  duration_minutes: number; // e.g., 30
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  notes: string | null;
  reason_for_visit: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

/**
 * Core configuration mappings for the MediSmile MVP Demo Loop
 */
export const CLINIC_CALENDAR_CONFIG = {
  slotDurationMinutes: 30, 
  defaultServiceType: 'Root Canal Treatment',
  currencyCode: 'PHP',
  localeSymbol: '₱',
  businessHours: {
    start: '09:00',
    end: '17:00',
  },
  statusColorMap: {
    pending: { bg: 'bg-amber-50 border-amber-200 text-amber-700', badge: 'bg-amber-100 text-amber-800' },
    approved: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
    rejected: { bg: 'bg-rose-50 border-rose-200 text-rose-700', badge: 'bg-rose-100 text-rose-800' },
    suspended: { bg: 'bg-slate-50 border-slate-200 text-slate-700', badge: 'bg-slate-100 text-slate-800' }
  }
};

/**
 * Transforms a raw Supabase record into clean UI parameters using Native JavaScript Dates
 */
export function formatAppointmentForCalendarEvent(appt: SupabaseAppointment) {
  const startTime = new Date(appt.scheduled_at);
  const endTime = new Date(startTime.getTime() + (appt.duration_minutes || CLINIC_CALENDAR_CONFIG.slotDurationMinutes) * 60000);
  
  // Format time layout natively (e.g., "10:00 AM")
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Format date layout natively (e.g., "September 13, 2026")
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return {
    id: appt.id,
    title: appt.service_type || CLINIC_CALENDAR_CONFIG.defaultServiceType,
    start: startTime,
    end: endTime,
    patientName: appt.profiles?.full_name || 'Anonymous Patient',
    reason: appt.reason_for_visit || 'Routine checkup',
    styles: CLINIC_CALENDAR_CONFIG.statusColorMap[appt.status] || CLINIC_CALENDAR_CONFIG.statusColorMap.pending,
    timeLabel: `${formatTime(startTime)} - ${formatTime(endTime)}`,
    formattedDate: formatDate(startTime)
  };
}
