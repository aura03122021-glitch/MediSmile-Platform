import { useEffect, useState } from 'react';
import { Activity, Save, CheckCircle2, X } from 'lucide-react';
import { fetchPatientChart, savePatientChart } from '../../lib/live-data';

type ColorCategory = 'healthy' | 'treated' | 'attention' | 'missing';

const CONDITION_CATALOG: { value: string; label: string; color: ColorCategory }[] = [
  { value: 'healthy', label: 'Healthy', color: 'healthy' },
  { value: 'cavity', label: 'Cavity', color: 'attention' },
  { value: 'filling', label: 'Filling', color: 'treated' },
  { value: 'root_canal', label: 'Root Canal', color: 'treated' },
  { value: 'crown', label: 'Crown', color: 'treated' },
  { value: 'chipped', label: 'Chipped / Fractured', color: 'attention' },
  { value: 'sensitive', label: 'Sensitive', color: 'attention' },
  { value: 'impacted', label: 'Impacted', color: 'attention' },
  { value: 'extraction_needed', label: 'Extraction Needed', color: 'attention' },
  { value: 'orthodontic', label: 'Orthodontic Appliance', color: 'treated' },
  { value: 'whitening', label: 'Whitening / Cosmetic', color: 'treated' },
  { value: 'missing', label: 'Missing', color: 'missing' },
];

const COLOR_STYLES: Record<ColorCategory, string> = {
  healthy: 'border-[#8fd1bb] bg-[#dff4e9]',
  treated: 'border-[#e7c46b] bg-[#fff1c9]',
  attention: 'border-[#ff8888] bg-[#ffe0dc]',
  missing: 'border-[#c5ccd1] bg-[#e9edf0]',
};

function conditionColor(value: string): ColorCategory {
  return CONDITION_CATALOG.find((c) => c.value === value)?.color ?? 'healthy';
}

function conditionLabel(value: string): string {
  return CONDITION_CATALOG.find((c) => c.value === value)?.label ?? value;
}

interface ToothData {
  condition: string;
  note: string;
}

interface DentalData {
  teeth: Record<string, ToothData>;
  oralHealthNotes: string;
  allergies: string;
  conditions: string;
}

function defaultData(): DentalData {
  const teeth: Record<string, ToothData> = {};
  for (let i = 1; i <= 32; i++) teeth[i] = { condition: 'healthy', note: '' };
  return { teeth, oralHealthNotes: '', allergies: '', conditions: '' };
}

interface Props {
  doctorProfileId: string;
  patientId: string;
  isWalkin: boolean;
}

export default function DentalChartEditor({ doctorProfileId, patientId, isWalkin }: Props) {
  const [chart, setChart] = useState<DentalData>(defaultData());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [popupTooth, setPopupTooth] = useState<number | null>(null);
  const [popupCondition, setPopupCondition] = useState('healthy');
  const [popupNote, setPopupNote] = useState('');

  useEffect(() => {
    setLoading(true);
    setSaved(false);
    fetchPatientChart(doctorProfileId, patientId, isWalkin, 'dental').then((existing) => {
      if (existing?.data) {
        const d = existing.data as Partial<DentalData>;
        setChart({ ...defaultData(), ...d, teeth: { ...defaultData().teeth, ...(d.teeth ?? {}) } });
      } else {
        setChart(defaultData());
      }
      setLoading(false);
    });
  }, [doctorProfileId, patientId, isWalkin]);

  function openTooth(n: number) {
    const current = chart.teeth[n] ?? { condition: 'healthy', note: '' };
    setPopupCondition(current.condition);
    setPopupNote(current.note);
    setPopupTooth(n);
  }

  function savePopup() {
    if (popupTooth === null) return;
    setChart((prev) => ({ ...prev, teeth: { ...prev.teeth, [popupTooth]: { condition: popupCondition, note: popupNote } } }));
    setPopupTooth(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await savePatientChart(doctorProfileId, patientId, isWalkin, 'dental', chart as unknown as Record<string, unknown>);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-xl bg-white p-8 text-center text-sm text-[#82919c] shadow-[0_2px_16px_rgba(0,0,0,0.07)]">Loading dental chart...</div>;
  }

  const upper = Array.from({ length: 16 }, (_, i) => i + 1);
  const lower = Array.from({ length: 16 }, (_, i) => i + 17);

  return (
    <div className="space-y-4">
      {popupTooth !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1A2B3C]">Tooth #{popupTooth}</h3>
              <button onClick={() => setPopupTooth(null)} className="rounded-lg p-1 text-[#607181] hover:bg-[#f8fafb]"><X size={16} /></button>
            </div>
            <label className="mb-1 block text-xs font-semibold text-[#1A2B3C]">Condition</label>
            <select value={popupCondition} onChange={(e) => setPopupCondition(e.target.value)} className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-sm">
              {CONDITION_CATALOG.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <label className="mb-1 mt-3 block text-xs font-semibold text-[#1A2B3C]">Note (optional)</label>
            <textarea value={popupNote} onChange={(e) => setPopupNote(e.target.value)} rows={2} placeholder="e.g. Scheduled for filling June 24"
              className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-sm" />
            <div className="mt-4 flex gap-2">
              <button onClick={() => setPopupTooth(null)} className="flex-1 rounded-xl border border-[#dce8e8] py-2 text-xs font-semibold text-[#607181] hover:bg-[#f8fafb]">Cancel</button>
              <button onClick={savePopup} className="flex-1 rounded-xl bg-[#0D6E6E] py-2 text-xs font-bold text-white hover:bg-[#095a5a]">Apply</button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-bold">Dental Chart</h2>
            <p className="mt-1 text-xs text-[#82919c]">Click any tooth to set its condition</p>
          </div>
          <span className="rounded-lg bg-[#edf8f7] p-2 text-[#0D6E6E]"><Activity size={17} /></span>
        </div>

        <div className="mt-5 rounded-xl bg-[#fbfcfc] px-3 py-4">
          <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[.15em] text-[#9aa6ae]">Upper Jaw</p>
          <div className="grid grid-cols-16 gap-1.5 sm:gap-2">
            {upper.map((n) => {
              const tooth = chart.teeth[n] ?? { condition: 'healthy', note: '' };
              return (
                <button
                  key={n}
                  onClick={() => openTooth(n)}
                  aria-label={`Tooth ${n} ${conditionLabel(tooth.condition)}`}
                  title={conditionLabel(tooth.condition)}
                  className={`relative h-8 rounded-[9px] border-2 transition hover:-translate-y-1 sm:h-9 ${COLOR_STYLES[conditionColor(tooth.condition)]}`}
                >
                  <span className="text-[9px] font-bold text-[#56706e]">{n}</span>
                  {tooth.note && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#0D6E6E] ring-2 ring-white" />}
                </button>
              );
            })}
          </div>
          <div className="my-4 border-t border-dashed border-[#dbe4e6]" />
          <div className="grid grid-cols-16 gap-1.5 sm:gap-2">
            {lower.map((n) => {
              const tooth = chart.teeth[n] ?? { condition: 'healthy', note: '' };
              return (
                <button
                  key={n}
                  onClick={() => openTooth(n)}
                  aria-label={`Tooth ${n} ${conditionLabel(tooth.condition)}`}
                  title={conditionLabel(tooth.condition)}
                  className={`relative h-8 rounded-[9px] border-2 transition hover:-translate-y-1 sm:h-9 ${COLOR_STYLES[conditionColor(tooth.condition)]}`}
                >
                  <span className="text-[9px] font-bold text-[#56706e]">{n}</span>
                  {tooth.note && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#0D6E6E] ring-2 ring-white" />}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[.15em] text-[#9aa6ae]">Lower Jaw</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-medium text-[#687984]">
          <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#8fd1bb]" />Healthy</span>
          <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#e7c46b]" />Treated</span>
          <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#ff8888]" />Needs Attention</span>
          <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#c5ccd1]" />Missing</span>
        </div>

        <div className="mt-4 space-y-1.5 border-t border-[#f0f3f5] pt-3">
          {Object.entries(chart.teeth).filter(([, t]) => t.condition !== 'healthy' || t.note).map(([num, t]) => (
            <div key={num} className="flex items-center justify-between rounded-lg bg-[#f8fafb] px-3 py-1.5 text-[11px]">
              <span className="font-semibold text-[#1A2B3C]">Tooth #{num} — {conditionLabel(t.condition)}</span>
              {t.note && <span className="text-[#9aa6ae]">{t.note}</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
        <h2 className="mb-3 text-[15px] font-bold">Oral Health Notes</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1A2B3C]">Allergies</label>
            <input value={chart.allergies} onChange={(e) => setChart((p) => ({ ...p, allergies: e.target.value }))} placeholder="e.g. Penicillin"
              className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-xs focus:border-[#0D6E6E] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1A2B3C]">Conditions</label>
            <input value={chart.conditions} onChange={(e) => setChart((p) => ({ ...p, conditions: e.target.value }))} placeholder="e.g. Mild Gingivitis"
              className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-xs focus:border-[#0D6E6E] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1A2B3C]">Notes</label>
            <textarea value={chart.oralHealthNotes} onChange={(e) => setChart((p) => ({ ...p, oralHealthNotes: e.target.value }))} rows={3}
              className="w-full rounded-lg border border-[#dce8e8] px-3 py-2 text-xs focus:border-[#0D6E6E] focus:outline-none" />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="mt-4 flex items-center gap-2 rounded-lg bg-[#0D6E6E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#095a5a] disabled:opacity-60">
          {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save Chart'}
        </button>
      </section>
    </div>
  );
}