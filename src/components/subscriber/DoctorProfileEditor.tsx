import { FormEvent, useEffect, useState } from 'react';
import { Stethoscope, FileText, Upload, Trash2, ExternalLink, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import {
  updateMyDoctorProfile,
  fetchDoctorByProfileId,
  DoctorProfile,
  WorkingHours,
  DayHours,
  fetchClinicDocuments,
  uploadClinicDocument,
  deleteClinicDocument,
  ClinicDocument,
  DOCUMENT_TYPES,
} from '../../lib/live-data';

const specialtyOptions = ['General Dentistry', 'Orthodontics', 'Cosmetic Restorations', 'Pediatric Dentistry', 'Oral Surgery', 'General Medicine', 'Pediatrics', 'Internal Medicine', 'Dermatology'];
const hmoOptions = ['Maxicare', 'Intellicare', 'Medicard', 'Kaiser', 'PhilHealth'];
const paymentOptions = ['cash', 'card', 'gcash', 'maya', 'bank_transfer', 'insurance'];
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export default function DoctorProfileEditor() {
  const { activeUser } = useAuth();
  const [tab, setTab] = useState<'profile' | 'documents'>('profile');
  const [doctorId, setDoctorId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [specialties, setSpecialties] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [prcLicenseNumber, setPrcLicenseNumber] = useState('');
  const [medicalDegree, setMedicalDegree] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [acceptedHmos, setAcceptedHmos] = useState<string[]>([]);
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<string[]>([]);
  const [consultationFee, setConsultationFee] = useState(500);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: true, start: '09:00', end: '12:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [documents, setDocuments] = useState<ClinicDocument[]>([]);
  const [docLoading, setDocLoading] = useState(true);
  const [uploadType, setUploadType] = useState(DOCUMENT_TYPES[0].value);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadIssued, setUploadIssued] = useState('');
  const [uploadExpiry, setUploadExpiry] = useState('');
  const [uploading, setUploading] = useState(false);
  const [docError, setDocError] = useState('');

  useEffect(() => {
    if (!activeUser) return;
    fetchDoctorByProfileId(activeUser.id).then((doctor: DoctorProfile | null) => {
      if (doctor) {
        setDoctorId(doctor.id);
        setSpecialties(doctor.specialties);
        setBio(doctor.bio);
        setClinicName(doctor.clinicName);
        setClinicAddress(doctor.clinicAddress);
        setCity(doctor.city);
        setProvince(doctor.province);
        setPrcLicenseNumber(doctor.prcLicenseNumber);
        setMedicalDegree(doctor.medicalDegree);
        setYearsOfExperience(doctor.yearsOfExperience);
        setAcceptedHmos(doctor.acceptedHmos);
        setAcceptedPaymentMethods(doctor.acceptedPaymentMethods);
        setConsultationFee(doctor.consultationFeeCents / 100);
        setWorkingHours(doctor.workingHours);
        loadDocuments(doctor.id);
      }
      setLoading(false);
    });
  }, [activeUser]);

  function loadDocuments(id: string) {
    setDocLoading(true);
    fetchClinicDocuments(id).then(setDocuments).finally(() => setDocLoading(false));
  }

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function updateDay(day: keyof WorkingHours, patch: Partial<DayHours>) {
    setWorkingHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (specialties.length === 0) { setError('Select at least one specialty.'); return; }
    if (!clinicName.trim()) { setError('Clinic/practice name is required.'); return; }
    if (!activeUser) { setError('You must be signed in.'); return; }

    setSaving(true);
    try {
      await updateMyDoctorProfile(activeUser.id, {
        specialties,
        bio: bio.trim(),
        clinicName: clinicName.trim(),
        clinicAddress: clinicAddress.trim(),
        city: city.trim(),
        province: province.trim(),
        prcLicenseNumber: prcLicenseNumber.trim(),
        medicalDegree: medicalDegree.trim(),
        yearsOfExperience,
        languages: ['Filipino', 'English'],
        acceptedPaymentMethods,
        acceptedHmos,
        consultationFeeCents: Math.round(consultationFee * 100),
        workingHours,
      });
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    setDocError('');
    if (!uploadFile) { setDocError('Choose a file to upload.'); return; }
    if (!doctorId) return;

    setUploading(true);
    try {
      await uploadClinicDocument({
        doctorId,
        documentType: uploadType,
        file: uploadFile,
        issuedDate: uploadIssued,
        expiryDate: uploadExpiry,
      });
      setUploadFile(null);
      setUploadIssued('');
      setUploadExpiry('');
      loadDocuments(doctorId);
    } catch (err) {
      setDocError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(doc: ClinicDocument) {
    if (!confirm(`Remove ${DOCUMENT_TYPES.find((t) => t.value === doc.documentType)?.label}?`)) return;
    await deleteClinicDocument(doc.id, doc.fileUrl);
    loadDocuments(doctorId);
  }

  if (loading) {
    return <div className="flex min-h-[300px] items-center justify-center text-sm text-[#607181]">Loading your profile...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex gap-2">
        <button onClick={() => setTab('profile')} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === 'profile' ? 'bg-[#0D6E6E] text-white' : 'bg-white text-[#607181] border border-[#dce8e8]'}`}>
          Edit Profile
        </button>
        <button onClick={() => setTab('documents')} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === 'documents' ? 'bg-[#0D6E6E] text-white' : 'bg-white text-[#607181] border border-[#dce8e8]'}`}>
          Clinic Documents
        </button>
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[#e5f0ef] bg-white p-8 shadow-sm">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{success}</div>}

          <section>
            <h3 className="mb-3 text-sm font-bold text-[#1A2B3C]">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {specialtyOptions.map((s) => (
                <button type="button" key={s} onClick={() => toggle(specialties, setSpecialties, s)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${specialties.includes(s) ? 'border-[#0D6E6E] bg-[#0D6E6E] text-white' : 'border-[#dce8e8] text-[#516373] hover:bg-[#f2fafa]'}`}>
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">Clinic / Practice Name</label>
              <input value={clinicName} onChange={(e) => setClinicName(e.target.value)}
                className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">Clinic Address</label>
              <input value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)}
                className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">Province</label>
              <input value={province} onChange={(e) => setProvince(e.target.value)}
                className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">PRC License Number</label>
              <input value={prcLicenseNumber} onChange={(e) => setPrcLicenseNumber(e.target.value)}
                className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">Medical/Dental Degree</label>
              <input value={medicalDegree} onChange={(e) => setMedicalDegree(e.target.value)}
                className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">Years of Experience</label>
              <input type="number" min={0} value={yearsOfExperience} onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">Consultation Fee (₱)</label>
              <input type="number" min={0} step={50} value={consultationFee} onChange={(e) => setConsultationFee(Number(e.target.value))}
                className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
            </div>
          </section>

          <section>
            <label className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">Short Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
              className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold text-[#1A2B3C]">Accepted HMOs / Insurance</h3>
            <div className="flex flex-wrap gap-2">
              {hmoOptions.map((h) => (
                <button type="button" key={h} onClick={() => toggle(acceptedHmos, setAcceptedHmos, h)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${acceptedHmos.includes(h) ? 'border-[#0D6E6E] bg-[#0D6E6E] text-white' : 'border-[#dce8e8] text-[#516373] hover:bg-[#f2fafa]'}`}>
                  {h}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold text-[#1A2B3C]">Accepted Payment Methods</h3>
            <div className="flex flex-wrap gap-2">
              {paymentOptions.map((p) => (
                <button type="button" key={p} onClick={() => toggle(acceptedPaymentMethods, setAcceptedPaymentMethods, p)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition ${acceptedPaymentMethods.includes(p) ? 'border-[#0D6E6E] bg-[#0D6E6E] text-white' : 'border-[#dce8e8] text-[#516373] hover:bg-[#f2fafa]'}`}>
                  {p.replace('_', ' ')}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold text-[#1A2B3C]">Working Hours</h3>
            <div className="space-y-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#dce8e8] px-3.5 py-2.5">
                  <label className="flex w-28 shrink-0 items-center gap-2 text-xs font-semibold capitalize text-[#1A2B3C]">
                    <input type="checkbox" checked={workingHours[day].enabled} onChange={(e) => updateDay(day, { enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-[#dce8e8] accent-[#0D6E6E]" />
                    {day}
                  </label>
                  <input type="time" value={workingHours[day].start} disabled={!workingHours[day].enabled} onChange={(e) => updateDay(day, { start: e.target.value })}
                    className="rounded-lg border border-[#dce8e8] px-2.5 py-1.5 text-xs disabled:opacity-40" />
                  <span className="text-xs text-[#607181]">to</span>
                  <input type="time" value={workingHours[day].end} disabled={!workingHours[day].enabled} onChange={(e) => updateDay(day, { end: e.target.value })}
                    className="rounded-lg border border-[#dce8e8] px-2.5 py-1.5 text-xs disabled:opacity-40" />
                </div>
              ))}
            </div>
          </section>

          <button type="submit" disabled={saving}
            className="w-full rounded-xl bg-[#0D6E6E] py-3 text-sm font-bold text-white transition hover:bg-[#095a5a] disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'documents' && (
        <div className="space-y-5">
          <form onSubmit={handleUpload} className="rounded-2xl border border-[#e5f0ef] bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#1A2B3C]">
              <Upload size={16} className="text-[#0D6E6E]" /> Upload a Document
            </h3>
            {docError && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{docError}</div>}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-[#1A2B3C]">Document Type</label>
                <select value={uploadType} onChange={(e) => setUploadType(e.target.value)}
                  className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm">
                  {DOCUMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-[#1A2B3C]">File (PDF or image)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1A2B3C]">Issued Date</label>
                <input type="date" value={uploadIssued} onChange={(e) => setUploadIssued(e.target.value)}
                  className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1A2B3C]">Expiry Date</label>
                <input type="date" value={uploadExpiry} onChange={(e) => setUploadExpiry(e.target.value)}
                  className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm" />
              </div>
            </div>

            <button type="submit" disabled={uploading}
              className="mt-4 flex items-center gap-2 rounded-xl bg-[#0D6E6E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#095a5a] disabled:opacity-60">
              <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>

          <div className="rounded-2xl border border-[#e5f0ef] bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#1A2B3C]">
              <FileText size={16} className="text-[#0D6E6E]" /> Uploaded Documents
            </h3>

            {docLoading ? (
              <p className="text-xs text-[#607181]">Loading documents...</p>
            ) : documents.length === 0 ? (
              <p className="text-xs text-[#607181]">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => {
                  const label = DOCUMENT_TYPES.find((t) => t.value === doc.documentType)?.label ?? doc.documentType;
                  const isExpired = doc.expiryDate ? new Date(doc.expiryDate) < new Date() : false;
                  const isExpiringSoon = doc.expiryDate ? new Date(doc.expiryDate) < new Date(Date.now() + 30 * 86400000) && !isExpired : false;

                  return (
                    <div key={doc.id} className="flex items-center justify-between rounded-xl border border-[#e5ebed] px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1A2B3C]">{label}</p>
                        <p className="truncate text-xs text-[#607181]">{doc.fileName}</p>
                        {doc.expiryDate && (
                          <p className={`mt-0.5 flex items-center gap-1 text-[11px] font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-[#607181]'}`}>
                            {isExpired ? <AlertCircle size={11} /> : isExpiringSoon ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                            {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring soon' : 'Valid'} &middot; {new Date(doc.expiryDate).toLocaleDateString('en-PH')}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-[#607181] hover:bg-[#f8fafb]">
                          <ExternalLink size={15} />
                        </a>
                        <button onClick={() => handleDelete(doc)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}