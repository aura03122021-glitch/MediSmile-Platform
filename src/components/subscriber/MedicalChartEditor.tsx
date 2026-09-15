import { useEffect, useState } from 'react';
import { HeartPulse, Save, CheckCircle2 } from 'lucide-react';
import { fetchPatientChart, savePatientChart } from '../../lib/live-data';

interface MedicalData {
  bloodPressure: string;
  heartRate: string;
  weight: string;
  height: string;
  temperature: string;
  allergies: string;
  conditions: string;
  diagnosis: string;
  treatmentPlan: string;
  notes: string;
}

function defaultData(): MedicalData {
  return {
    bloodPressure: '',
    heartRate: '',
    weight: '',
    height: '',
    temperature: '',
    allergies: '',
    conditions: '',
    diagnosis: '',
    treatmentPlan: '',
    notes: '',
  };
}

interface Props {
  doctorProfileId: string;
  patientId: string;
  isWalkin: boolean;
}

export default function MedicalChartEditor({ doctorProfileId, patientId, isWalkin }: Props) {
  const [chart, setChart] = useState<MedicalData>(defaultData());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setLoading(true);
    setSaved(false);
    setLoadError('');
    fetchPatientChart(doctorProfileId, patientId, isWalkin, 'medical')
      .then((existing) => {
        if (existing?.data) {
          setChart({ ...defaultData(), ...(existing.data as Partial<MedicalData>) });
        } else {
          setChart(defaultData());
        }
      })
      .catch((err) => {
        console.error('Chart load error:', err);
        setLoadError(err instanceof Error ? err.message : JSON.stringify(err));
      })
      .finally(() => setLoading(false));
  }, [doctorProfileId, patientId, isWalkin]);

  function update<K extends keyof MedicalData>(key: K, value: MedicalData[K]) {
    setChart((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await savePatientChart(doctorProfileId, patientId, isWalkin, 'medical', chart as unknown as Record<string, unknown>);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-xl bg-white p-8 text-center text-sm text-[#82919c] shadow-[0_2px_16px_rgba(0,0,0,0.07)]">Loading medical chart...</div>;
  }

  if (loadError) {
    return <div className="rounded-xl bg-white p-8 text-center text-sm text-red-600 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">Error: {loadError}</div>;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-[#fff0ee] p-2 text-[#FF6B6B]"><HeartPulse size={16} /></span>
          <h2 className="text-[15px] font-bold">Vital Signs</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Blood Pressure" placeholder="e.g. 118/76 mmHg" value={chart.bloodPressure} onChange={(v) => update('bloodPressure', v)} />
          <Field label="Heart Rate" placeholder="e.g. 72 bpm" value={chart.heartRate} onChange={(v) => update('heartRate', v)} />
          <Field label="Weight" placeholder="e.g. 78 kg" value={chart.weight} onChange={(v) => update('weight', v)} />
          <Field label="Height" placeholder="e.g. 5'11&quot;" value={chart.height} onChange={(v) => update('height', v)} />
          <Field label="Temperature" placeholder="e.g. 36.7°C" value={chart.temperature} onChange={(v) => update('temperature', v)} />
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
        <h2 className="mb-3 text-[15px] font-bold">Health Summary</h2>
        <div className="space-y-3">
          <Field label="Allergies" placeholder="e.g. Penicillin, Pollen" value={chart.allergies} onChange={(v) => update('allergies', v)} />
          <Field label="Conditions" placeholder="e.g. Hypertension" value={chart.conditions} onChange={(v) => update('conditions', v)} />
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
        <h2 className="mb-3 text-[15px] font-bold">Diagnosis & Treatment</h2>
        <div className="space-y-3">
          <TextAreaField label="Diagnosis" value={chart.diagnosis} onChange={(v) => update('diagnosis', v)} />
          <TextAreaField label="Treatment Plan" value={chart.treatmentPlan} onChange={(v) => update('treatmentPlan', v)} />
          <TextAreaField label="Additional Notes" value={chart.notes} onChange={(v) => update('notes', v)} />
        </div>

        <button onClick={handleSave} disabled={saving} className="mt-4 flex items-center gap-2 rounded-lg bg-[#0D6E6E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#095a5a] disabled:opacity-60">
          {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save Chart'}
        </button>
      </section>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }: { label: string; placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#1A2B3C]">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-xs focus:border-[#0D6E6E] focus:outline-none" />
    </div>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#1A2B3C]">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
        className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-xs focus:border-[#0D6E6E] focus:outline-none" />
    </div>
  );
}