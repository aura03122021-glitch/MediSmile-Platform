import { useMemo, useRef, useState, useEffect } from 'react';
import { fetchDoctorPatients } from '../../lib/live-data';
import { Activity, Check, ChevronRight, CircleHelp, Download, FileText, HeartPulse, Mail, Phone, Plus, Printer, Search, UploadCloud } from 'lucide-react';
type Patient = {
  name: string;
  id: string;
  last: string;
  initials: string;
};
let livePatients: Patient[] = [];
type ToothState = 'healthy' | 'treated' | 'attention' | 'missing';
const demoPatients: Patient[] = [{
  name: 'Marcus Reid',
  id: '#P-00421',
  last: 'Jun 12, 2026',
  initials: 'MR'
}, {
  name: 'Priya Sharma',
  id: '#P-00398',
  last: 'Jun 9, 2026',
  initials: 'PS'
}, {
  name: 'James Kowalski',
  id: '#P-00375',
  last: 'May 28, 2026',
  initials: 'JK'
}, {
  name: 'Aisha Mensah',
  id: '#P-00362',
  last: 'May 21, 2026',
  initials: 'AM'
}, {
  name: 'Tom Nguyen',
  id: '#P-00349',
  last: 'May 14, 2026',
  initials: 'TN'
}, {
  name: 'Linda Park',
  id: '#P-00331',
  last: 'Apr 30, 2026',
  initials: 'LP'
}, {
  name: 'David Chen',
  id: '#P-00318',
  last: 'Apr 22, 2026',
  initials: 'DC'
}, {
  name: 'Sofia Rossi',
  id: '#P-00305',
  last: 'Apr 10, 2026',
  initials: 'SR'
}];
const tabs = ['Overview', 'Dental Chart', 'Treatment History', 'Prescriptions', 'Documents'];
const toothStates: ToothState[] = ['healthy', 'healthy', 'healthy', 'treated', 'healthy', 'healthy', 'healthy', 'attention', 'healthy', 'healthy', 'healthy', 'healthy', 'treated', 'healthy', 'healthy', 'missing', 'healthy', 'healthy', 'healthy', 'treated', 'healthy', 'healthy', 'healthy', 'healthy', 'healthy', 'healthy', 'attention', 'healthy', 'healthy', 'healthy', 'healthy', 'healthy'];
const treatments = [['Jun 12, 2026', 'Routine Cleaning', 'Dr. Nguyen', 'Completed', 'No issues'], ['Mar 3, 2026', 'Cavity Filling (Tooth #8)', 'Dr. Nguyen', 'Completed', 'Composite resin'], ['Jan 15, 2026', 'X-Ray Full Mouth', 'Dr. Patel', 'Completed', 'Normal findings'], ['Jun 24, 2026', 'Cavity Filling (Tooth #14)', 'Dr. Nguyen', 'Upcoming', 'Pre-booked']];
const documents = [['X-Ray_Aug2026.pdf', 'Jun 12, 2026'], ['Insurance_Card.jpg', 'Jan 10, 2026'], ['Consent_Form.pdf', 'Jan 10, 2026']];
function PatientSidebar({
  selected,
  setSelected,
  patients,
}: {
  selected: string;
  setSelected: (name: string) => void;
  patients?: Patient[];
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const patientRows = patients ?? livePatients;
  const filtered = useMemo(() => patientRows.filter(patient => patient.name.toLowerCase().includes(query.toLowerCase()) || patient.id.toLowerCase().includes(query.toLowerCase())), [patientRows, query]);
  return <aside className="w-full shrink-0 border-b border-[#e1e8ed] bg-white lg:w-[280px] lg:border-b-0 lg:border-r" aria-label="Patient list">
    <div className="p-5"><div className="flex items-center justify-between"><h2 className="text-[18px] font-bold">Patients</h2><button className="inline-flex items-center gap-1 rounded-lg bg-[#0D6E6E] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#095a5a]"><Plus size={14} /> <span>Add Patient</span></button></div>
      <label className="relative mt-5 block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#82919c]" size={16} /><input value={query} onChange={event => setQuery(event.target.value)} className="h-10 w-full rounded-lg border border-[#E0E7EF] bg-white pl-9 pr-3 text-xs outline-none transition focus:border-[#0D6E6E]" placeholder="Search by name, ID, or phone…" aria-label="Search patients" /></label>
      <div className="mt-3 flex gap-1.5">{['All', 'Active', 'New', 'Archived'].map(item => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${filter === item ? 'bg-[#0D6E6E] text-white' : 'bg-[#f1f5f6] text-[#71808b] hover:bg-[#e4efee]'}`}>{item}</button>)}</div>
    </div>
    <div className="max-h-[360px] overflow-y-auto px-2 pb-3 lg:max-h-[calc(100vh-172px)]">{filtered.map(patient => <button key={patient.id} onClick={() => setSelected(patient.name)} className={`flex w-full items-center gap-3 rounded-r-xl border-l-4 px-3 py-3 text-left transition ${selected === patient.name ? 'border-[#0D6E6E] bg-[#e8f5f4]' : 'border-transparent hover:bg-[#f6fafa]'}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d9efed] text-xs font-bold text-[#0D6E6E]">{patient.initials}</span><span className="min-w-0 flex-1"><strong className="block truncate text-[13px] font-bold text-[#243746]">{patient.name}</strong><span className="mt-0.5 block text-[11px] text-[#82919c]">{patient.id}</span></span><span className="self-start pt-1 text-right text-[10px] leading-4 text-[#8996a0]">{patient.last.replace(', 2026', '')}</span></button>)}</div>
  </aside>;
}
function DentalChart() {
  const [hovered, setHovered] = useState<number | null>(14);
  return <section className="rounded-xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]"><div className="flex items-start justify-between"><div><h2 className="text-[16px] font-bold">Dental Chart</h2><p className="mt-1 text-xs text-[#82919c]">Click any tooth to view details</p></div><span className="rounded-lg bg-[#edf8f7] p-2 text-[#0D6E6E]"><Activity size={17} /></span></div><div className="mt-5 rounded-xl bg-[#fbfcfc] px-3 py-4"><p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[.15em] text-[#9aa6ae]">Upper Jaw</p><div className="grid grid-cols-16 gap-1.5 sm:gap-2">{toothStates.slice(0, 16).map((state, index) => <button key={`upper-${index + 1}`} onMouseEnter={() => setHovered(index + 1)} onFocus={() => setHovered(index + 1)} onClick={() => setHovered(index + 1)} aria-label={`Tooth ${index + 1} ${state}`} className={`relative h-8 rounded-[9px] border-2 transition hover:-translate-y-1 sm:h-9 ${state === 'healthy' ? 'border-[#8fd1bb] bg-[#dff4e9]' : state === 'treated' ? 'border-[#e7c46b] bg-[#fff1c9]' : state === 'attention' ? 'border-[#ff8888] bg-[#ffe0dc]' : 'border-[#c5ccd1] bg-[#e9edf0]'}`}><span className="text-[9px] font-bold text-[#56706e]">{index + 1}</span>{index + 1 === 14 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#FF6B6B] ring-2 ring-white" />}</button>)}</div><div className="my-4 border-t border-dashed border-[#dbe4e6]" /><div className="grid grid-cols-16 gap-1.5 sm:gap-2">{toothStates.slice(16).map((state, index) => <button key={`lower-${index + 17}`} onMouseEnter={() => setHovered(index + 17)} onFocus={() => setHovered(index + 17)} aria-label={`Tooth ${index + 17} ${state}`} className={`h-8 rounded-[9px] border-2 transition hover:-translate-y-1 sm:h-9 ${state === 'healthy' ? 'border-[#8fd1bb] bg-[#dff4e9]' : state === 'treated' ? 'border-[#e7c46b] bg-[#fff1c9]' : state === 'attention' ? 'border-[#ff8888] bg-[#ffe0dc]' : 'border-[#c5ccd1] bg-[#e9edf0]'}`}><span className="text-[9px] font-bold text-[#56706e]">{index + 17}</span></button>)}</div><p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[.15em] text-[#9aa6ae]">Lower Jaw</p></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-3 text-[10px] font-medium text-[#687984]"><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#8fd1bb]" />Healthy</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#e7c46b]" />Treated</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#ff8888]" />Needs Attention</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#c5ccd1]" />Missing</span></div>{hovered === 14 && <div className="rounded-lg border border-[#ffd0ca] bg-[#fff6f4] px-3 py-2 text-[11px] text-[#7a5150]"><strong className="text-[#d95555]">Tooth #14</strong> — Cavity Detected · Scheduled for filling Jun 24</div>}</div></section>;
}
export default function PatientRecords({ doctorProfileId }: { doctorProfileId?: string }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const uploadRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!doctorProfileId) return;
    fetchDoctorPatients(doctorProfileId).then((rows) => {
      const loadedPatients = rows.map((row) => ({ name: row.name, id: row.id, last: row.last, initials: row.initials }));
      livePatients = loadedPatients;
      setPatients(loadedPatients);
      setSelected((current) => current || loadedPatients[0]?.name || '');
    });
  }, [doctorProfileId]);
  return <div className="flex flex-col text-[#1A2B3C] antialiased lg:flex-row" style={{ minHeight: 'calc(100vh - 64px)' }}><PatientSidebar selected={selected} setSelected={setSelected} /><section className="min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-7"><div className="mx-auto max-w-[760px]"><div className="rounded-xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]"><div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"><div className="flex items-start gap-4"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#0D6E6E] text-xl font-bold text-white">MR</span><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-[24px] font-bold tracking-[-.03em]">{selected}</h1><span className="rounded-full bg-[#e5f7ed] px-2.5 py-1 text-[10px] font-bold text-[#16845b]">Active Patient</span></div><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#71808b]"><span>🎂 Age: 34</span><span>🩸 Blood Type: O+</span><span>⚧ Male</span><span><Phone size={11} className="mr-1 inline" />(555) 820-4421</span><span><Mail size={11} className="mr-1 inline" />marcus@email.com</span></div></div></div><div className="flex flex-wrap gap-2"><button className="rounded-lg border border-[#cbdadd] px-3 py-2 text-xs font-bold text-[#0D6E6E] hover:bg-[#edf8f7]">Edit Record</button><button className="rounded-lg bg-[#0D6E6E] px-3 py-2 text-xs font-bold text-white hover:bg-[#095a5a]">Book Appointment</button><button className="rounded-lg border border-[#cbdadd] p-2 text-[#0D6E6E] hover:bg-[#edf8f7]" aria-label="Print record"><Printer size={16} /></button></div></div></div><div className="mt-4 flex gap-5 overflow-x-auto border-b border-[#dfe7eb] px-1">{tabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap border-b-2 px-1 pb-3 pt-1 text-xs font-semibold ${activeTab === tab ? 'border-[#0D6E6E] text-[#0D6E6E]' : 'border-transparent text-[#7b8993] hover:text-[#0D6E6E]'}`}>{tab}</button>)}</div>{activeTab === 'Overview' ? <div className="space-y-4 pt-4"><div className="grid gap-4 md:grid-cols-2"><section className="rounded-xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]"><div className="flex items-center gap-2"><span className="rounded-lg bg-[#eaf7f5] p-2 text-[#0D6E6E]"><HeartPulse size={16} /></span><h2 className="text-[15px] font-bold">Health Summary</h2></div><div className="mt-4 space-y-3">{[['Allergies', 'Penicillin, Pollen'], ['Conditions', 'Mild Gingivitis, Seasonal Allergies'], ['Insurance', 'Maxicare Gold'], ['Last Visit', 'Jun 12, 2026'], ['Next Appointment', 'Jun 24, 2026']].map(item => <div key={item[0]} className="flex items-start justify-between gap-3 text-xs"><span className="text-[#7c8b95]">{item[0]}</span><strong className="text-right font-semibold text-[#354c5b]">{item[1]}</strong></div>)}</div></section><section className="rounded-xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]"><div className="flex items-center gap-2"><span className="rounded-lg bg-[#fff0ee] p-2 text-[#FF6B6B]"><Activity size={16} /></span><h2 className="text-[15px] font-bold">Vital Signs <span className="font-normal text-[#8b989f]">(Last Visit)</span></h2></div><div className="mt-4 space-y-3 text-xs"><div className="flex justify-between"><span className="text-[#7c8b95]">Blood Pressure</span><strong>118/76 mmHg <Check size={13} className="ml-1 inline text-[#1a9a70]" /></strong></div><div className="flex justify-between"><span className="text-[#7c8b95]">Heart Rate</span><strong>72 bpm <Check size={13} className="ml-1 inline text-[#1a9a70]" /></strong></div><div className="flex justify-between"><span className="text-[#7c8b95]">Weight</span><strong>78 kg</strong></div><div className="flex justify-between"><span className="text-[#7c8b95]">Height</span><strong>5'11&quot;</strong></div><div><div className="flex justify-between"><span className="text-[#7c8b95]">Oral Health Score</span><strong className="text-[#0D6E6E]">7.4/10</strong></div><div className="mt-2 h-2 rounded-full bg-[#e4efee]"><div className="h-2 w-[74%] rounded-full bg-[#0D6E6E]" /></div></div></div></section></div><DentalChart /><section className="rounded-xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]"><div className="flex items-center justify-between"><div><h2 className="text-[16px] font-bold">Recent Treatments</h2><p className="mt-1 text-xs text-[#82919c]">A clear view of Marcus's care journey</p></div><a href="#history" className="text-xs font-bold text-[#0D6E6E]">View Full History <ChevronRight size={13} className="inline" /></a></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-[11px]"><thead><tr className="border-b border-[#edf0f1] text-[10px] uppercase tracking-wider text-[#9aa5ab]"><th className="pb-3 font-semibold">Date</th><th className="pb-3 font-semibold">Treatment</th><th className="pb-3 font-semibold">Doctor</th><th className="pb-3 font-semibold">Status</th><th className="pb-3 font-semibold">Notes</th></tr></thead><tbody>{treatments.map(row => <tr key={row[0] + row[1]} className="border-b border-[#f1f3f4] last:border-0"><td className="py-3 text-[#75858e]">{row[0]}</td><td className="py-3 font-semibold text-[#344b5a]">{row[1]}</td><td className="py-3 text-[#75858e]">{row[2]}</td><td className={`py-3 font-semibold ${row[3] === 'Upcoming' ? 'text-[#c98222]' : 'text-[#19916a]'}`}>{row[3] === 'Upcoming' ? '◷' : '✓'} {row[3]}</td><td className="py-3 text-[#75858e]">{row[4]}</td></tr>)}</tbody></table></div></section></div> : <div className="mt-4 rounded-xl bg-white p-10 text-center shadow-[0_2px_16px_rgba(0,0,0,0.07)]"><CircleHelp className="mx-auto text-[#0D6E6E]" /><h2 className="mt-3 text-lg font-bold">{activeTab}</h2><p className="mt-2 text-sm text-[#71808b]">Select this tab to review Marcus Reid's {activeTab.toLowerCase()}.</p></div>}</div></section><aside className="w-full shrink-0 border-t border-[#e1e8ed] bg-white px-5 py-5 lg:w-[285px] lg:border-l lg:border-t-0"><section><h2 className="text-[15px] font-bold">Next Appointment</h2><div className="mt-3 rounded-xl bg-[#edf8f7] p-4"><div className="flex gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-center text-[10px] font-bold leading-4 text-[#0D6E6E]">JUN<br /><strong className="text-lg">24</strong></span><div><p className="text-[13px] font-bold">10:00 AM</p><p className="mt-1 text-[11px] text-[#657b83]">Dr. Sarah Nguyen</p><p className="mt-0.5 text-[11px] text-[#657b83]">Cavity Filling</p></div></div><div className="mt-4 flex items-center justify-between"><button className="text-[11px] font-semibold text-[#71808b] hover:text-[#0D6E6E]">Reschedule</button><button className="rounded-lg bg-[#0D6E6E] px-3 py-2 text-[11px] font-bold text-white">View Details</button></div></div></section><section className="mt-6 border-t border-[#edf0f1] pt-5"><h2 className="text-[15px] font-bold">Active Prescriptions</h2><div className="mt-3 space-y-2">{[['Amoxicillin 500mg', '2x daily', 'Expires Jul 1'], ['Ibuprofen 400mg', 'As needed', 'Expires Jun 30']].map(item => <div key={item[0]} className="rounded-lg border border-[#edf0f1] p-3"><p className="text-[12px] font-bold">💊 {item[0]}</p><p className="mt-1 text-[11px] text-[#73838d]">{item[1]} <span className="mx-1 text-[#c4cdd1]">·</span> {item[2]}</p></div>)}</div><a href="#prescriptions" className="mt-3 inline-block text-[11px] font-bold text-[#0D6E6E]">View All Prescriptions →</a></section><section className="mt-6 border-t border-[#edf0f1] pt-5"><h2 className="text-[15px] font-bold">Documents</h2><button onClick={() => uploadRef.current?.click()} className="mt-3 flex w-full flex-col items-center rounded-xl border border-dashed border-[#9bc5c2] bg-[#f8fcfc] px-3 py-4 text-center hover:bg-[#edf8f7]"><UploadCloud size={21} className="text-[#0D6E6E]" /><span className="mt-2 text-[11px] font-semibold text-[#526875]">Drag & drop or click to upload</span><span className="mt-1 text-[10px] text-[#9aa6ae]">PDF, JPG, PNG up to 10MB</span></button><input ref={uploadRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" /><div className="mt-3 space-y-1">{documents.map(file => <div key={file[0]} className="flex items-center gap-2 rounded-lg p-2 hover:bg-[#f7fafb]"><FileText size={16} className="shrink-0 text-[#0D6E6E]" /><span className="min-w-0 flex-1"><strong className="block truncate text-[11px] font-semibold">{file[0]}</strong><span className="text-[10px] text-[#9aa6ae]">{file[1]}</span></span><button aria-label={`Download ${file[0]}`} className="text-[#7b8b94] hover:text-[#0D6E6E]"><Download size={14} /></button></div>)}</div></section><section className="mt-6 border-t border-[#edf0f1] pt-5"><h2 className="text-[15px] font-bold">Reminders</h2><div className="mt-3 space-y-3">{[['🔔', 'Appointment reminder', '24hrs before · SMS'], ['🔔', 'Medication reminder', 'Daily 8AM · Email']].map(item => <div key={item[1]} className="flex items-center gap-2"><span className="text-sm">{item[0]}</span><span className="min-w-0 flex-1"><strong className="block text-[11px] font-semibold">{item[1]}</strong><span className="text-[10px] text-[#89969d]">{item[2]}</span></span><span className="grid h-5 w-9 place-items-center rounded-full bg-[#0D6E6E] text-white"><Check size={11} /></span></div>)}</div><a href="#reminders" className="mt-3 inline-block text-[11px] font-bold text-[#0D6E6E]">Manage Reminders →</a></section></aside></div>;
}