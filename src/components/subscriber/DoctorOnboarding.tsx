import { FormEvent, useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { updateMyDoctorProfile } from '../../lib/live-data';

const specialtyOptions = ['General Dentistry', 'Orthodontics', 'Cosmetic Restorations', 'Pediatric Dentistry', 'Oral Surgery', 'General Medicine', 'Pediatrics', 'Internal Medicine', 'Dermatology'];
const hmoOptions = ['Maxicare', 'Intellicare', 'Medicard', 'Kaiser', 'PhilHealth'];
const paymentOptions = ['cash', 'card', 'gcash', 'maya', 'bank_transfer', 'insurance'];

interface DoctorOnboardingProps {
  onComplete: () => void;
}

export default function DoctorOnboarding({ onComplete }: DoctorOnboardingProps) {
  const { activeUser } = useAuth();
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
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<string[]>(['cash', 'gcash']);
  const [consultationFee, setConsultationFee] = useState(500);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (specialties.length === 0) { setError('Select at least one specialty.'); return; }
    if (!clinicName.trim()) { setError('Clinic/practice name is required.'); return; }
    if (!clinicAddress.trim() || !city.trim() || !province.trim()) { setError('Full clinic address is required.'); return; }
    if (!prcLicenseNumber.trim()) { setError('PRC license number is required.'); return; }
    if (!medicalDegree.trim()) { setError('Medical/dental degree is required.'); return; }

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
      });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0D6E6E] text-white">
            <Stethoscope size={19} />
          </div>
          <div>
            <p className="text-lg font-bold text-[#1A2B3C]">Complete Your Doctor Profile</p>
            <p className="text-xs text-[#607181]">This information is reviewed by MediSmile before your account is approved.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[#e5f0ef] bg-white p-8 shadow-sm">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

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
              <input value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="MediSmile Dental Main Practice"
                className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">Clinic Address</label>
              <input value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} placeholder="Unit 4B, Medical Plaza Building, Ortigas Center"
                className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Pasig"
                className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">Province</label>
              <input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Metro Manila"
                className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">PRC License Number</label>
              <input value={prcLicenseNumber} onChange={(e) => setPrcLicenseNumber(e.target.value)} placeholder="0123456"
                className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">Medical/Dental Degree</label>
              <input value={medicalDegree} onChange={(e) => setMedicalDegree(e.target.value)} placeholder="DDS, University of the Philippines"
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
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell patients about your practice and approach to care."
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

          <button type="submit" disabled={saving}
            className="w-full rounded-xl bg-[#0D6E6E] py-3 text-sm font-bold text-white transition hover:bg-[#095a5a] disabled:opacity-60">
            {saving ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
}