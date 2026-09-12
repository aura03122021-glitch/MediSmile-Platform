import { useState } from 'react';
import { ArrowRight, Bell, CalendarDays, Check, ChevronRight, Clock3, CreditCard, Facebook, FileText, HeartPulse, Instagram, Linkedin, Mail, Menu, Play, ShieldCheck, Stethoscope, Users, X } from 'lucide-react';
import { useSiteContent } from '../../lib/site-content-context';

type Feature = { title: string; description: string; icon: typeof CalendarDays; accent: string };
type Testimonial = { name: string; role: string; clinic: string; initials: string; quote: string };
type Pricing = { name: string; price: string; suffix: string; description: string; features: string[]; highlighted?: boolean; action: string };

const features: Feature[] = [
  { title: 'Appointment Scheduling', description: 'Smart calendar with online booking, automated slot management, and patient self-scheduling.', icon: CalendarDays, accent: 'bg-[#e5f4f3]' },
  { title: 'Patient Records', description: 'Secure digital health records, treatment history, dental charts, and document uploads.', icon: FileText, accent: 'bg-[#fff0ee]' },
  { title: 'Billing & Invoicing', description: 'Automated billing, insurance claim tracking, payment receipts, and financial reports.', icon: CreditCard, accent: 'bg-[#e8f3f7]' },
  { title: 'Prescriptions', description: 'Digital e-prescriptions, medication history, dosage tracking, and pharmacy integration.', icon: HeartPulse, accent: 'bg-[#f2eee8]' },
  { title: 'Follow-Up Reminders', description: 'Automated SMS/email reminders for appointments, medications, and post-treatment check-ins.', icon: Bell, accent: 'bg-[#eaf4ed]' },
];

const testimonials: Testimonial[] = [
  { name: 'Dr. Maya Pascual', role: 'Orthodontist', clinic: 'BrightLine Dental', initials: 'MP', quote: 'MediSmile gave our front desk hours back every week. Patients love booking on their own, and our schedule is finally calm.' },
  { name: 'Dr. James Villanueva', role: 'Practice Director', clinic: 'Harbor Medical Group', initials: 'JV', quote: 'Billing is accurate, transparent, and remarkably easy to track. We have a much clearer picture of the health of our practice.' },
  { name: 'Dr. Sofia Reyes', role: 'Family Dentist', clinic: 'Cedar Dentistry', initials: 'SR', quote: 'The reminders have transformed patient communication. Our follow-ups feel personal without adding more work to the team.' },
];

const pricing: Pricing[] = [
  { name: 'Starter', price: '₱2,499', suffix: '/mo', description: 'The essentials for a growing practice.', features: ['Up to 2 practitioners', 'Core scheduling', 'Digital patient records', 'Email support'], action: 'Get Started' },
  { name: 'Growth', price: '₱5,999', suffix: '/mo', description: 'Everything you need to run smarter.', features: ['Up to 10 practitioners', 'Full feature suite', 'Billing & prescriptions', 'Priority support', 'Advanced reporting'], highlighted: true, action: 'Get Started' },
  { name: 'Enterprise', price: 'Custom', suffix: '', description: 'A tailored platform for your network.', features: ['Unlimited practitioners', 'Custom integrations', 'Dedicated support', 'Advanced security controls'], action: 'Contact Sales' },
];

const footerLinks = [
  { heading: 'Product', links: ['Features', 'Pricing', 'Security', 'Integrations'] },
  { heading: 'Company', links: ['About MediSmile', 'Careers', 'Partners', 'Contact'] },
  { heading: 'Resources', links: ['Help Center', 'Practice guides', 'API docs', 'Status'] },
  { heading: 'Legal', links: ['Privacy policy', 'Terms of service', 'Data protection', 'Accessibility'] },
];

interface MediSmileLandingProps {
  onNavigate: (path: string) => void;
}

export default function MediSmileLanding({ onNavigate }: MediSmileLandingProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const { content: siteContent } = useSiteContent();

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8FAFB] text-[#1A2B3C] antialiased">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 lg:px-8" aria-label="Primary navigation">
        <a href="#top" className="flex items-center gap-2.5 text-xl font-bold tracking-[-0.03em] text-[#0D6E6E]">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0D6E6E] text-white shadow-sm"><Stethoscope size={19} strokeWidth={2.5} /></span>
          <span>MediSmile</span>
        </a>
        <div className="hidden items-center gap-9 text-sm font-medium text-[#516373] md:flex">
          <a href="#features" className="transition-colors hover:text-[#0D6E6E]">Features</a>
          <a href="#pricing" className="transition-colors hover:text-[#0D6E6E]">Pricing</a>
          <a href="#about" className="transition-colors hover:text-[#0D6E6E]">About</a>
          <button onClick={() => onNavigate('/for-providers')} className="transition-colors hover:text-[#0D6E6E]">For Doctors</button>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <button onClick={() => onNavigate('/login')} className="rounded-full border border-[#b8d0d0] bg-white px-5 py-2.5 text-sm font-semibold text-[#0D6E6E] transition hover:border-[#0D6E6E] hover:bg-[#f2fafa]">
            Portal Login
          </button>
          <button onClick={() => onNavigate('/login?signup=patient')} className="rounded-full bg-[#0D6E6E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(13,110,110,0.18)] transition hover:bg-[#095a5a]">
            Find a Doctor
          </button>
        </div>
        <button className="rounded-lg p-2 text-[#0D6E6E] md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation menu">{menuOpen ? <X /> : <Menu />}</button>
      </nav>

      {menuOpen && (
        <div className="mx-6 flex flex-col gap-4 rounded-2xl border border-[#dceceb] bg-white p-5 text-sm font-semibold text-[#516373] shadow-lg md:hidden">
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <button onClick={() => { setMenuOpen(false); onNavigate('/for-providers'); }}>For Doctors</button>
          <button onClick={() => { setMenuOpen(false); onNavigate('/login'); }} className="rounded-full bg-[#0D6E6E] px-5 py-3 text-center text-white">Portal Login</button>
        </div>
      )}

      {/* Hero */}
      <section id="top" className="mx-auto grid max-w-[1240px] items-center gap-14 px-6 pb-20 pt-14 lg:grid-cols-[0.94fr_1.06fr] lg:px-8 lg:pb-28 lg:pt-20">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#e7f4f3] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#0D6E6E]">
            <span className="h-2 w-2 rounded-full bg-[#FF6B6B]" />Healthcare made simple
          </p>
          <h1 className="max-w-[650px] text-5xl font-bold leading-[1.04] tracking-[-0.055em] text-[#1A2B3C] sm:text-6xl lg:text-[70px]">
            Your Health, <span className="text-[#0D6E6E]">One Click Away</span>
          </h1>
          <p className="mt-7 max-w-[535px] text-lg leading-8 text-[#607181]">
            Find trusted doctors near you, book appointments instantly, and manage your health records — all in one platform built for Filipino patients and clinics.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button onClick={() => onNavigate('/login?signup=patient')} className="inline-flex items-center gap-2 rounded-full bg-[#0D6E6E] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(13,110,110,0.2)] transition hover:-translate-y-0.5 hover:bg-[#095a5a]">
              Find a Doctor <ArrowRight size={16} />
            </button>
            <button onClick={() => onNavigate('/for-providers')} className="inline-flex items-center gap-2 rounded-full border border-[#b8d0d0] bg-white px-6 py-3.5 text-sm font-bold text-[#0D6E6E] transition hover:border-[#0D6E6E] hover:bg-[#f2fafa]">
              For Clinics & Doctors <ChevronRight size={15} />
            </button>
          </div>
          <p className="mt-5 text-xs font-medium text-[#82909c]">Free for patients · No credit card required</p>
        </div>

        {/* Dashboard preview card */}
        <div className="relative rounded-[34px] bg-[linear-gradient(135deg,#e7f6f4_0%,#d9eeef_50%,#f8e9e7_100%)] p-5 shadow-[0_25px_70px_rgba(13,110,110,0.12)] sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[#0D6E6E]">Good morning, Dr. Santos</p><p className="mt-1 text-sm text-[#70828d]">Wednesday, September 11</p></div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#0D6E6E] shadow-sm"><Bell size={17} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1.08fr_0.92fr]">
            <article className="rounded-2xl bg-white p-5 shadow-[0_12px_28px_rgba(26,43,60,0.09)]">
              <div className="flex items-center justify-between"><h2 className="text-sm font-bold">Upcoming appointments</h2><span className="text-xs font-semibold text-[#0D6E6E]">View all</span></div>
              <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#edf8f7] p-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#cce9e6] text-xs font-bold text-[#0D6E6E]">MR</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">Marcus Reyes</p><p className="mt-1 text-[11px] text-[#7b8b95]">Routine check-up</p></div><span className="text-[11px] font-bold text-[#0D6E6E]">09:30</span></div>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#edf0f0] p-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#fff0ee] text-xs font-bold text-[#d75e5e]">PS</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">Priya Sharma</p><p className="mt-1 text-[11px] text-[#7b8b95]">Follow-up visit</p></div><span className="text-[11px] font-bold text-[#657783]">10:15</span></div>
            </article>
            <article className="rounded-2xl bg-[#0D6E6E] p-5 text-white shadow-[0_12px_28px_rgba(13,110,110,0.18)]">
              <div className="flex items-center justify-between"><h2 className="text-sm font-bold">Today</h2><CalendarDays size={17} className="text-[#b9e5df]" /></div>
              <p className="mt-7 text-4xl font-bold tracking-[-0.06em]">24</p>
              <p className="mt-1 text-xs text-[#b9e5df]">appointments scheduled</p>
              <div className="mt-7 h-1.5 rounded-full bg-[#4a9997]"><div className="h-1.5 w-[72%] rounded-full bg-white" /></div>
              <p className="mt-2 text-[11px] text-[#b9e5df]">72% of daily capacity</p>
            </article>
          </div>
          <article className="mt-4 rounded-2xl bg-white p-5 shadow-[0_12px_28px_rgba(26,43,60,0.09)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#fff0ee] text-[#FF6B6B]"><CreditCard size={16} /></span><h2 className="text-sm font-bold">Monthly billing</h2></div>
              <span className="text-xs font-bold text-[#1c966f]">+12.4%</span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-2xl font-bold tracking-[-0.04em]">₱921,000 <span className="text-xs font-medium text-[#8996a0]">collected</span></p>
              <div className="flex items-end gap-1"><span className="h-5 w-1.5 rounded-t bg-[#b7dcda]" /><span className="h-8 w-1.5 rounded-t bg-[#83c2bd]" /><span className="h-6 w-1.5 rounded-t bg-[#4fa29c]" /><span className="h-11 w-1.5 rounded-t bg-[#0D6E6E]" /><span className="h-9 w-1.5 rounded-t bg-[#70b8b3]" /><span className="h-14 w-1.5 rounded-t bg-[#0D6E6E]" /></div>
            </div>
          </article>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-[#e7eeee] bg-white py-9">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-6 px-6 lg:flex-row lg:justify-between lg:px-8">
          <p className="text-sm font-semibold text-[#7b8b95]">Trusted by {siteContent.stats[0]?.number || '500+'} clinics across the Philippines</p>
          <div className="flex w-full flex-wrap items-center justify-center gap-x-9 gap-y-4 text-sm font-bold tracking-tight text-[#a3afb4] sm:justify-end">
            <span>Northstar Health</span><span>WellNest</span><span>Orbit Medical</span><span>Vivid Dental</span><span>CareNest</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-[1240px] px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF6B6B]">One calm workspace</p>
          <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#1A2B3C] sm:text-5xl">Everything Your Clinic Needs</h2>
          <p className="mt-5 text-lg text-[#70818d]">Purpose-built tools for dental and medical practices of every size.</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-6">
          {features.map(feature => (
            <article key={feature.title} className="group rounded-2xl border border-[#e6eeee] bg-white p-7 shadow-[0_7px_22px_rgba(25,53,63,0.035)] transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(25,53,63,0.1)] md:col-span-2 [&:nth-child(4)]:md:col-start-2">
              <div className={`grid h-12 w-12 place-items-center rounded-xl ${feature.accent} text-[#0D6E6E] transition group-hover:scale-105`}><feature.icon size={22} /></div>
              <h3 className="mt-6 text-lg font-bold tracking-[-0.02em]">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#70818d]">{feature.description}</p>
              <a href="#pricing" className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-[#0D6E6E]">Explore feature <ChevronRight size={14} /></a>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="about" className="bg-[#e9f6f5] py-20">
        <div className="mx-auto max-w-[1080px] px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0D6E6E]">A simpler way forward</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#1A2B3C] sm:text-5xl">Up and Running in Minutes</h2>
          </div>
          <div className="mt-14 grid gap-9 md:grid-cols-3 md:gap-8">
            {[
              { n: '1', title: 'Find Your Doctor', desc: 'Search by specialty, location, or clinic name' },
              { n: '2', title: 'Book an Appointment', desc: 'Choose your preferred date and time slot' },
              { n: '3', title: 'Get Care', desc: 'Visit the clinic and manage your health records online' },
            ].map((step, i) => (
              <div key={step.n} className="relative text-center md:text-left">
                <div className="flex items-center gap-4 md:block">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${i === 0 ? 'bg-[#0D6E6E] text-white' : 'border-2 border-[#0D6E6E] bg-white text-[#0D6E6E]'} text-lg font-bold`}>{step.n}</span>
                  {i < 2 && <div className="hidden h-px flex-1 bg-[#a4d5d1] md:block" />}
                </div>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#607b83]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0D6E6E] text-white">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {siteContent.stats.map(stat => (
            <div key={stat.label} className="border-l border-[#4b9996] pl-5">
              <p className="text-3xl font-bold tracking-[-0.05em]">{stat.number}</p>
              <p className="mt-1 text-sm text-[#bce4e1]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-[1240px] px-6 py-24 lg:px-8 lg:py-32">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF6B6B]">Patient-first teams</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">What Our Clients Say</h2>
          </div>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map(t => (
            <article key={t.name} className="rounded-2xl border border-[#e5eeee] bg-white p-7 shadow-[0_7px_22px_rgba(25,53,63,0.035)]">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 text-[#FF6B6B]" aria-label="5 out of 5 stars">{[1,2,3,4,5].map(s => <span key={s}>★</span>)}</div>
                <span className="text-xs font-medium text-[#94a0a8]">Verified client</span>
              </div>
              <blockquote className="mt-7 text-[17px] font-medium leading-7 text-[#324858]">"{t.quote}"</blockquote>
              <div className="mt-8 flex items-center gap-3 border-t border-[#edf1f1] pt-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#dcefee] text-xs font-bold text-[#0D6E6E]">{t.initials}</span>
                <div><p className="text-sm font-bold">{t.name}</p><p className="mt-0.5 text-xs text-[#84939b]">{t.role}, {t.clinic}</p></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-[#f0f7f7] py-24 lg:py-32">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0D6E6E]">Plans that grow with you</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Simple, Transparent Pricing</h2>
            <p className="mt-5 text-lg text-[#70818d]">Start small, grow confidently, and only pay for what you need.</p>
          </div>
          <div className="mx-auto mt-14 grid max-w-[1050px] gap-5 lg:grid-cols-3">
            {pricing.map(plan => (
              <article key={plan.name} className={`relative rounded-2xl border bg-white p-8 ${plan.highlighted ? 'border-[#0D6E6E] shadow-[0_16px_40px_rgba(13,110,110,0.15)]' : 'border-[#e1ebeb] shadow-[0_7px_22px_rgba(25,53,63,0.035)]'}`}>
                {plan.highlighted && <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-[#0D6E6E] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Most Popular</span>}
                <p className="text-lg font-bold">{plan.name}</p>
                <p className="mt-2 text-sm text-[#768792]">{plan.description}</p>
                <p className="mt-7 text-4xl font-bold tracking-[-0.06em]">{plan.price}<span className="text-sm font-medium tracking-normal text-[#87949c]">{plan.suffix}</span></p>
                <ul className="mt-7 space-y-4 border-t border-[#edf0f0] pt-6">
                  {plan.features.map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-[#526673]">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#e6f4f3] text-[#0D6E6E]"><Check size={12} strokeWidth={3} /></span>{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => onNavigate(plan.name === 'Enterprise' ? '#contact' : '/login?role=subscriber')}
                  className={`mt-8 flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition ${plan.highlighted ? 'bg-[#0D6E6E] text-white hover:bg-[#095a5a]' : 'border border-[#b8d0d0] text-[#0D6E6E] hover:bg-[#edf8f7]'}`}>
                  {plan.action}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="mx-auto max-w-[1240px] px-6 py-20 lg:px-8">
        <div className="rounded-[28px] bg-[linear-gradient(115deg,#0b6263,#0D6E6E_55%,#398d87)] px-6 py-16 text-center text-white shadow-[0_20px_50px_rgba(13,110,110,0.2)] sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b8e5e1]">Your health journey starts here</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Ready to Find Your Doctor?</h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-[#d0eeeb]">Join thousands of Filipino patients already using MediSmile to book appointments and manage their health.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => onNavigate('/login?signup=patient')} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#0D6E6E] transition hover:bg-[#edfaf9]">
              Find a Doctor <ArrowRight size={16} />
            </button>
            <button onClick={() => onNavigate('/for-providers')} className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
              I'm a Doctor / Clinic
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e4eded] bg-white">
        <div className="mx-auto max-w-[1240px] px-6 pb-8 pt-16 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
            <div>
              <a href="#top" className="flex items-center gap-2.5 text-xl font-bold tracking-[-0.03em] text-[#0D6E6E]">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0D6E6E] text-white"><Stethoscope size={19} /></span>MediSmile
              </a>
              <p className="mt-5 max-w-[235px] text-sm leading-6 text-[#788a94]">The smarter way to find care and run a healthier clinic.</p>
              <div className="mt-6 flex gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f0f6f6] text-[#0D6E6E] hover:bg-[#dcefee]"><Linkedin size={16} /></span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f0f6f6] text-[#0D6E6E] hover:bg-[#dcefee]"><Instagram size={16} /></span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f0f6f6] text-[#0D6E6E] hover:bg-[#dcefee]"><Facebook size={16} /></span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
              {footerLinks.map(group => (
                <div key={group.heading}>
                  <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#1A2B3C]">{group.heading}</h2>
                  <ul className="mt-5 space-y-3">{group.links.map(link => <li key={link}><a href="#contact" className="text-sm text-[#788a94] transition hover:text-[#0D6E6E]">{link}</a></li>)}</ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-14 flex flex-col gap-3 border-t border-[#edf1f1] pt-6 text-xs text-[#89969d] sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; 2026 MediSmile Health Technologies. All rights reserved.</p>
            <p className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#0D6E6E]" /> Built for modern care teams</p>
          </div>
        </div>
      </footer>

      {/* Demo modal */}
      {demoOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1A2B3C]/40 px-6" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#FF6B6B]">A quick look inside</p><h2 className="mt-2 text-2xl font-bold">MediSmile in action</h2></div>
              <button onClick={() => setDemoOpen(false)} aria-label="Close demo" className="rounded-full p-2 text-[#71828c] hover:bg-[#f2f7f7]"><X size={18} /></button>
            </div>
            <div className="mt-6 rounded-2xl bg-[#e8f5f4] p-6">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0D6E6E] text-white"><Clock3 size={18} /></span><div><p className="text-sm font-bold">Save your team 8+ hours</p><p className="mt-1 text-xs text-[#607b83]">Every week, on the work that matters.</p></div></div>
            </div>
            <p className="mt-6 text-sm leading-6 text-[#70818d]">See how scheduling, records, and billing come together in one clear workspace built for care teams.</p>
            <button onClick={() => setDemoOpen(false)} className="mt-7 w-full rounded-full bg-[#0D6E6E] py-3.5 text-sm font-bold text-white hover:bg-[#095a5a]">Got it</button>
          </div>
        </div>
      )}
    </main>
  );
}
