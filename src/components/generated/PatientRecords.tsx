import { useMemo, useState, useEffect } from 'react';
import { fetchDoctorPatients, addWalkinPatient, fetchDoctorByProfileId, PatientListItem, fetchPatientVisitHistory, addWalkinVisitLog, VisitEntry } from '../../lib/live-data';
import { Search, Plus, Phone, Mail, X, UserPlus, FileText, Bell, Pill, ClipboardList, CalendarPlus } from 'lucide-react';
import DentalChartEditor from '../subscriber/DentalChartEditor';
import MedicalChartEditor from '../subscriber/MedicalChartEditor';

const tabs = ['Overview', 'Chart', 'History'];
const DENTAL_SPECIALTIES = ['General Dentistry', 'Orthodontics', 'Cosmetic Restorations', 'Pediatric Dentistry', 'Oral Surgery'];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-600',
  no_show: 'bg-slate-100 text-slate-600',
};

function PatientSidebar({
  patients,
  selectedId,
  setSelectedId,
  onAddPatient,
}: {
  patients: PatientListItem[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  onAddPatient: () => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () => patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [patients, query]
  );

  return (
    <aside className="w-full shrink-0 border-b border-[#e1e8ed] bg-white lg:w-[280px] lg:border-b-0 lg:border-r" aria-label="Patient list">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold">Patients</h2>
          <button onClick={onAddPatient} className="inline-flex items-center gap-1 rounded-lg bg-[#0D6E6E] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#095a5a]">
            <Plus size={14} /> <span>Add Patient</span>
          </button>
        </div>
        <label className="relative mt-5 block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#82919c]" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-[#E0E7EF] bg-white pl-9 pr-3 text-xs outline-none transition focus:border-[#0D6E6E]"
            placeholder="Search by name..."
            aria-label="Search patients"
          />
        </label>
      </div>
      <div className="max-h-[360px] overflow-y-auto px-2 pb-3 lg:max-h-[calc(100vh-172px)]">
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-[#9aa6ae]">No patients yet.</p>
        ) : (
          filtered.map((patient) => (
            <button
              key={patient.id}
              onClick={() => setSelectedId(patient.id)}
              className={`flex w-full items-center gap-3 rounded-r-xl border-l-4 px-3 py-3 text-left transition ${
                selectedId === patient.id ? 'border-[#0D6E6E] bg-[#e8f5f4]' : 'border-transparent hover:bg-[#f6fafa]'
              }`}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d9efed] text-xs font-bold text-[#0D6E6E]">
                {patient.initials}
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-[13px] font-bold text-[#243746]">{patient.name}</strong>
                <span className="mt-0.5 block text-[11px] text-[#82919c]">
                  {patient.isWalkin ? 'Walk-in' : 'Registered'}
                </span>
              </span>
              <span className="self-start pt-1 text-right text-[10px] leading-4 text-[#8996a0]">{patient.last}</span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

function AddPatientModal({ onClose, onSave }: { onClose: () => void; onSave: (input: { fullName: string; phone?: string; email?: string; notes?: string }) => Promise<void> }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!fullName.trim()) { setError('Full name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ fullName: fullName.trim(), phone: phone.trim() || undefined, email: email.trim() || undefined, notes: notes.trim() || undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add patient.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#1A2B3C]"><UserPlus size={18} className="text-[#0D6E6E]" /> Add Walk-in Patient</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#607181] hover:bg-[#f8fafb]"><X size={18} /></button>
        </div>
        {error && <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>}
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1A2B3C]">Full Name *</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-sm focus:border-[#0D6E6E] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1A2B3C]">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-sm focus:border-[#0D6E6E] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1A2B3C]">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-sm focus:border-[#0D6E6E] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1A2B3C]">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-sm focus:border-[#0D6E6E] focus:outline-none" />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-[#dce8e8] py-2.5 text-sm font-semibold text-[#607181] hover:bg-[#f8fafb]">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 rounded-xl bg-[#0D6E6E] py-2.5 text-sm font-bold text-white hover:bg-[#095a5a] disabled:opacity-60">
            {saving ? 'Adding...' : 'Add Patient'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LogVisitModal({ onClose, onSave }: { onClose: () => void; onSave: (input: { visitDate: string; serviceType: string; notes?: string }) => Promise<void> }) {
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [serviceType, setServiceType] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!serviceType.trim()) { setError('Service/treatment type is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ visitDate, serviceType: serviceType.trim(), notes: notes.trim() || undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log visit.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#1A2B3C]"><CalendarPlus size={18} className="text-[#0D6E6E]" /> Log a Visit</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#607181] hover:bg-[#f8fafb]"><X size={18} /></button>
        </div>
        {error && <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>}
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1A2B3C]">Visit Date</label>
            <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-sm focus:border-[#0D6E6E] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1A2B3C]">Service / Treatment *</label>
            <input value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder="e.g. Routine Cleaning" className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-sm focus:border-[#0D6E6E] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1A2B3C]">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-sm focus:border-[#0D6E6E] focus:outline-none" />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-[#dce8e8] py-2.5 text-sm font-semibold text-[#607181] hover:bg-[#f8fafb]">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 rounded-xl bg-[#0D6E6E] py-2.5 text-sm font-bold text-white hover:bg-[#095a5a] disabled:opacity-60">
            {saving ? 'Logging...' : 'Log Visit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatientRecords({ doctorProfileId }: { doctorProfileId?: string }) {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogVisitModal, setShowLogVisitModal] = useState(false);
  const [isDentalSpecialty, setIsDentalSpecialty] = useState(true);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<VisitEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!doctorProfileId) return;
    loadPatients();
    fetchDoctorByProfileId(doctorProfileId).then((doctor) => {
      if (doctor) {
        setIsDentalSpecialty(doctor.specialties.some((s) => DENTAL_SPECIALTIES.includes(s)));
      }
    });
  }, [doctorProfileId]);

  function loadPatients() {
    if (!doctorProfileId) return;
    setLoading(true);
    fetchDoctorPatients(doctorProfileId).then((rows) => {
      setPatients(rows);
      setSelectedId((current) => current || rows[0]?.id || '');
      setLoading(false);
    });
  }

  const selectedPatient = patients.find((p) => p.id === selectedId);

  useEffect(() => {
    if (!doctorProfileId || !selectedPatient) return;
    loadHistory();
  }, [doctorProfileId, selectedPatient?.id]);

  function loadHistory() {
    if (!doctorProfileId || !selectedPatient) return;
    setHistoryLoading(true);
    fetchPatientVisitHistory(doctorProfileId, selectedPatient.id, selectedPatient.isWalkin).then((rows) => {
      setHistory(rows);
      setHistoryLoading(false);
    });
  }

  async function handleAddPatient(input: { fullName: string; phone?: string; email?: string; notes?: string }) {
    if (!doctorProfileId) return;
    await addWalkinPatient(doctorProfileId, input);
    setShowAddModal(false);
    loadPatients();
  }

  async function handleLogVisit(input: { visitDate: string; serviceType: string; notes?: string }) {
    if (!doctorProfileId || !selectedPatient) return;
    await addWalkinVisitLog(doctorProfileId, selectedPatient.id, input);
    setShowLogVisitModal(false);
    loadHistory();
  }

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center text-sm text-[#82919c]">Loading patients...</div>;
  }

  return (
    <div className="flex flex-col text-[#1A2B3C] antialiased lg:flex-row" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {showAddModal && <AddPatientModal onClose={() => setShowAddModal(false)} onSave={handleAddPatient} />}
      {showLogVisitModal && <LogVisitModal onClose={() => setShowLogVisitModal(false)} onSave={handleLogVisit} />}

      <PatientSidebar patients={patients} selectedId={selectedId} setSelectedId={setSelectedId} onAddPatient={() => setShowAddModal(true)} />

      {!selectedPatient ? (
        <section className="flex flex-1 items-center justify-center px-4 py-10 text-center text-sm text-[#82919c]">
          No patients yet. Click "Add Patient" to add a walk-in, or wait for patients to book online.
        </section>
      ) : (
        <>
          <section className="min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-7">
            <div className="mx-auto max-w-[760px]">
              <div className="rounded-xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#0D6E6E] text-xl font-bold text-white">
                      {selectedPatient.initials}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-[24px] font-bold tracking-[-.03em]">{selectedPatient.name}</h1>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${selectedPatient.isWalkin ? 'bg-[#fff3cd] text-[#8a6d1d]' : 'bg-[#e5f7ed] text-[#16845b]'}`}>
                          {selectedPatient.isWalkin ? 'Walk-in Patient' : 'Registered Patient'}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#71808b]">
                        {selectedPatient.phone && <span><Phone size={11} className="mr-1 inline" />{selectedPatient.phone}</span>}
                        {selectedPatient.email && <span><Mail size={11} className="mr-1 inline" />{selectedPatient.email}</span>}
                        <span>Last visit: {selectedPatient.last}</span>
                      </div>
                    </div>
                  </div>
                  {selectedPatient.isWalkin && (
                    <button onClick={() => setShowLogVisitModal(true)} className="flex items-center gap-1.5 self-start rounded-lg bg-[#0D6E6E] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#095a5a]">
                      <CalendarPlus size={14} /> Log a Visit
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-5 overflow-x-auto border-b border-[#dfe7eb] px-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap border-b-2 px-1 pb-3 pt-1 text-xs font-semibold ${
                      activeTab === tab ? 'border-[#0D6E6E] text-[#0D6E6E]' : 'border-transparent text-[#7b8993] hover:text-[#0D6E6E]'
                    }`}
                  >
                    {tab === 'Chart' ? (isDentalSpecialty ? 'Dental Chart' : 'Medical Chart') : tab}
                  </button>
                ))}
              </div>

              {activeTab === 'Overview' && (
                <div className="space-y-4 pt-4">
                  <section className="rounded-xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
                    <h2 className="text-[15px] font-bold">Contact Information</h2>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-start justify-between gap-3 text-xs">
                        <span className="text-[#7c8b95]">Type</span>
                        <strong className="text-right font-semibold text-[#354c5b]">{selectedPatient.isWalkin ? 'Walk-in Patient' : 'Registered Patient'}</strong>
                      </div>
                      <div className="flex items-start justify-between gap-3 text-xs">
                        <span className="text-[#7c8b95]">Phone</span>
                        <strong className="text-right font-semibold text-[#354c5b]">{selectedPatient.phone || 'Not provided'}</strong>
                      </div>
                      <div className="flex items-start justify-between gap-3 text-xs">
                        <span className="text-[#7c8b95]">Email</span>
                        <strong className="text-right font-semibold text-[#354c5b]">{selectedPatient.email || 'Not provided'}</strong>
                      </div>
                      <div className="flex items-start justify-between gap-3 text-xs">
                        <span className="text-[#7c8b95]">Last Visit</span>
                        <strong className="text-right font-semibold text-[#354c5b]">{selectedPatient.last}</strong>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-4">
                      <button onClick={() => setActiveTab('Chart')} className="text-xs font-bold text-[#0D6E6E] hover:underline">
                        View {isDentalSpecialty ? 'Dental' : 'Medical'} Chart →
                      </button>
                      <button onClick={() => setActiveTab('History')} className="text-xs font-bold text-[#0D6E6E] hover:underline">
                        View Visit History →
                      </button>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'Chart' && doctorProfileId && (
                <div className="pt-4">
                  {isDentalSpecialty ? (
                    <DentalChartEditor doctorProfileId={doctorProfileId} patientId={selectedPatient.id} isWalkin={selectedPatient.isWalkin} />
                  ) : (
                    <MedicalChartEditor doctorProfileId={doctorProfileId} patientId={selectedPatient.id} isWalkin={selectedPatient.isWalkin} />
                  )}
                </div>
              )}

              {activeTab === 'History' && (
                <div className="pt-4">
                  <section className="rounded-xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
                    <div className="flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-[15px] font-bold">
                        <ClipboardList size={16} className="text-[#0D6E6E]" /> Visit History
                      </h2>
                      {selectedPatient.isWalkin && (
                        <button onClick={() => setShowLogVisitModal(true)} className="flex items-center gap-1 text-xs font-bold text-[#0D6E6E] hover:underline">
                          <CalendarPlus size={13} /> Log a Visit
                        </button>
                      )}
                    </div>

                    {historyLoading ? (
                      <p className="mt-4 text-xs text-[#82919c]">Loading history...</p>
                    ) : history.length === 0 ? (
                      <p className="mt-4 text-xs text-[#9aa6ae]">No visit history yet.</p>
                    ) : (
                      <div className="mt-4 space-y-2">
                        {history.map((entry) => (
                          <div key={entry.id} className="rounded-lg border border-[#edf0f1] p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-[#1A2B3C]">{entry.serviceType}</p>
                              {entry.status && (
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[entry.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                  {entry.status.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[11px] text-[#82919c]">
                              {new Date(entry.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            {entry.notes && <p className="mt-1.5 text-[11px] text-[#607181]">{entry.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </div>
          </section>

          <aside className="w-full shrink-0 border-t border-[#e1e8ed] bg-white px-5 py-5 lg:w-[285px] lg:border-l lg:border-t-0">
            <ComingSoonSection icon={Pill} title="Prescriptions" />
            <ComingSoonSection icon={FileText} title="Documents" />
            <ComingSoonSection icon={Bell} title="Reminders" />
          </aside>
        </>
      )}
    </div>
  );
}

function ComingSoonSection({ icon: Icon, title }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string }) {
  return (
    <section className="border-t border-[#edf0f1] pt-5 first:border-t-0 first:pt-0">
      <h2 className="flex items-center gap-2 text-[15px] font-bold">
        <Icon size={15} className="text-[#0D6E6E]" /> {title}
      </h2>
      <p className="mt-2 rounded-lg bg-[#f8fafb] px-3 py-2.5 text-[11px] text-[#9aa6ae]">Coming soon.</p>
    </section>
  );
}