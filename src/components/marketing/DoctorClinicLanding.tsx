import { useState } from 'react';
import {
  Stethoscope,
  CalendarDays,
  FileText,
  CreditCard,
  Bell,
  HeartPulse,
  Users,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Check,
  ChevronRight,
  Play,
  Clock3,
  X,
} from 'lucide-react';
import { formatPHP } from '../../lib/currency';
import { demoSubscriptionTiers } from '../../lib/demo-data';

interface DoctorClinicLandingProps {
  onSignUp: () => void;
}

type Feature = {
  title: string;
  description: string;
  icon: typeof CalendarDays;
  accent: string;
  iconColor: string;
};

type Testimonial = {
  name: string;
  role: string;
  clinic: string;
  initials: string;
  quote: string;
};

const features: Feature[] = [
  {
    title: 'Appointment Scheduling',
    description:
      'Smart calendar with online booking, automated slot management, and patient self-scheduling.',
    icon: CalendarDays,
    accent: 'bg-[#e5f4f3]',
    iconColor: 'text-[#0D6E6E]',
  },
  {
    title: 'Patient Records',
    description:
      'Secure digital health records, treatment history, dental charts, and document uploads.',
    icon: FileText,
    accent: 'bg-[#fff0ee]',
    iconColor: 'text-[#d75e5e]',
  },
  {
    title: 'Billing & Invoicing',
    description:
      'Automated billing with insurance claim tracking, payment receipts, and financial reports.',
    icon: CreditCard,
    accent: 'bg-[#e8f3f7]',
    iconColor: 'text-[#2a7ea8]',
  },
  {
    title: 'Prescriptions',
    description:
      'Digital e-prescriptions, medication history, dosage tracking, and pharmacy integration.',
    icon: HeartPulse,
    accent: 'bg-[#f2eee8]',
    iconColor: 'text-[#8b6e44]',
  },
  {
    title: 'Follow-Up Reminders',
    description:
      'Automated SMS/email reminders for appointments, medications, and post-treatment check-ins.',
    icon: Bell,
    accent: 'bg-[#eaf4ed]',
    iconColor: 'text-[#2d8455]',
  },
];

const testimonials: Testimonial[] = [
  {
    name: 'Dr. Maya Pascual',
    role: 'Orthodontist',
    clinic: 'BrightLine Dental',
    initials: 'MP',
    quote:
      'MediSmile gave our front desk hours back every week. Patients love booking on their own, and our schedule is finally calm.',
  },
  {
    name: 'Dr. James Villanueva',
    role: 'Practice Director',
    clinic: 'Harbor Medical Group',
    initials: 'JV',
    quote:
      'Billing is accurate, transparent, and remarkably easy to track. We have a much clearer picture of the health of our practice.',
  },
  {
    name: 'Dr. Sofia Reyes',
    role: 'Family Dentist',
    clinic: 'Cedar Dentistry',
    initials: 'SR',
    quote:
      'The reminders have transformed patient communication. Our follow-ups feel personal without adding more work to the team.',
  },
];

const socialProofClinics = [
  'Northstar Health',
  'WellNest',
  'Orbit Medical',
  'Vivid Dental',
  'CareNest',
];

const steps = [
  {
    number: '1',
    title: 'Add Your Clinic',
    description: 'Set up your practice profile in minutes',
  },
  {
    number: '2',
    title: 'Import Patients',
    description: 'Bring existing records or start fresh',
  },
  {
    number: '3',
    title: 'Go Live',
    description: 'Start scheduling and managing from day one',
  },
];

const stats = [
  { number: '500+', label: 'Clinics' },
  { number: '1M+', label: 'Appointments Managed' },
  { number: '98%', label: 'Patient Satisfaction' },
  { number: '24/7', label: 'Support' },
];

export default function DoctorClinicLanding({ onSignUp }: DoctorClinicLandingProps) {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-[#1A2B3C] antialiased">
      {/* Hero */}
      <section className="mx-auto max-w-[1240px] px-6 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[0.94fr_1.06fr]">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#e7f4f3] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#0D6E6E]">
              <Stethoscope size={14} />
              For Doctors &amp; Clinics
            </p>
            <h1 className="max-w-[650px] text-5xl font-bold leading-[1.04] tracking-[-0.055em] text-[#1A2B3C] sm:text-6xl lg:text-[70px]">
              Grow Your Practice with{' '}
              <span className="text-[#0D6E6E]">MediSmile</span>
            </h1>
            <p className="mt-7 max-w-[535px] text-lg leading-8 text-[#607181]">
              The complete clinic management platform — scheduling, records, billing,
              prescriptions, and patient engagement, all in one place.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                onClick={onSignUp}
                className="inline-flex items-center gap-2 rounded-full bg-[#0D6E6E] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(13,110,110,0.2)] transition hover:-translate-y-0.5 hover:bg-[#095a5a]"
              >
                Start Free Trial <ArrowRight size={16} />
              </button>
              <button
                onClick={() => setDemoOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[#b8d0d0] bg-white px-6 py-3.5 text-sm font-bold text-[#0D6E6E] transition hover:border-[#0D6E6E] hover:bg-[#f2fafa]"
              >
                <Play size={15} fill="currentColor" /> Watch Demo
              </button>
            </div>
            <p className="mt-5 text-xs font-medium text-[#82909c]">
              No credit card required · Set up in under 5 minutes
            </p>
          </div>

          {/* Mock dashboard preview */}
          <div className="relative rounded-[34px] bg-[linear-gradient(135deg,#e7f6f4_0%,#d9eeef_50%,#f8e9e7_100%)] p-5 shadow-[0_25px_70px_rgba(13,110,110,0.12)] sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#0D6E6E]">
                  Good morning, Doctor
                </p>
                <p className="mt-1 text-sm text-[#70828d]">Your clinic at a glance</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#0D6E6E] shadow-sm">
                <Bell size={17} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.08fr_0.92fr]">
              {/* Appointments card */}
              <article className="rounded-2xl bg-white p-5 shadow-[0_12px_28px_rgba(26,43,60,0.09)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold">Upcoming appointments</h2>
                  <span className="text-xs font-semibold text-[#0D6E6E]">View all</span>
                </div>
                <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#edf8f7] p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#cce9e6] text-xs font-bold text-[#0D6E6E]">
                    MR
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">Marcus Reyes</p>
                    <p className="mt-1 text-[11px] text-[#7b8b95]">Routine cleaning</p>
                  </div>
                  <span className="text-[11px] font-bold text-[#0D6E6E]">09:30</span>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#edf0f0] p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#fff0ee] text-xs font-bold text-[#d75e5e]">
                    PS
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">Priya Sharma</p>
                    <p className="mt-1 text-[11px] text-[#7b8b95]">Cavity filling</p>
                  </div>
                  <span className="text-[11px] font-bold text-[#657783]">10:30</span>
                </div>
              </article>

              {/* Today stats card */}
              <article className="rounded-2xl bg-[#0D6E6E] p-5 text-white shadow-[0_12px_28px_rgba(13,110,110,0.18)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold">Today</h2>
                  <CalendarDays size={17} className="text-[#b9e5df]" />
                </div>
                <p className="mt-7 text-4xl font-bold tracking-[-0.06em]">18</p>
                <p className="mt-1 text-xs text-[#b9e5df]">appointments scheduled</p>
                <div className="mt-7 h-1.5 rounded-full bg-[#4a9997]">
                  <div className="h-1.5 w-[65%] rounded-full bg-white" />
                </div>
                <p className="mt-2 text-[11px] text-[#b9e5df]">65% of daily capacity</p>
              </article>
            </div>

            {/* Patients overview */}
            <article className="mt-4 rounded-2xl bg-white p-5 shadow-[0_12px_28px_rgba(26,43,60,0.09)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e5f4f3] text-[#0D6E6E]">
                    <Users size={16} />
                  </span>
                  <h2 className="text-sm font-bold">Active patients</h2>
                </div>
                <span className="text-xs font-bold text-[#1c966f]">
                  <TrendingUp size={12} className="mr-1 inline" />
                  +8.2%
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <p className="text-2xl font-bold tracking-[-0.04em]">
                  1,247{' '}
                  <span className="text-xs font-medium text-[#8996a0]">this month</span>
                </p>
                <div className="flex items-end gap-1">
                  <span className="h-5 w-1.5 rounded-t bg-[#b7dcda]" />
                  <span className="h-8 w-1.5 rounded-t bg-[#83c2bd]" />
                  <span className="h-6 w-1.5 rounded-t bg-[#4fa29c]" />
                  <span className="h-11 w-1.5 rounded-t bg-[#0D6E6E]" />
                  <span className="h-9 w-1.5 rounded-t bg-[#70b8b3]" />
                  <span className="h-14 w-1.5 rounded-t bg-[#0D6E6E]" />
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-[#e7eeee] bg-white py-9">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-6 px-6 lg:flex-row lg:justify-between lg:px-8">
          <p className="text-sm font-semibold text-[#7b8b95]">
            Trusted by 500+ clinics across the Philippines
          </p>
          <div className="flex w-full flex-wrap items-center justify-center gap-x-9 gap-y-4 text-sm font-bold tracking-tight text-[#a3afb4] sm:justify-end">
            {socialProofClinics.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-[1240px] px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF6B6B]">
            One calm workspace
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#1A2B3C] sm:text-5xl">
            Everything Your Clinic Needs
          </h2>
          <p className="mt-5 text-lg text-[#70818d]">
            Purpose-built tools for dental and medical practices of every size.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-6">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group rounded-2xl border border-[#e6eeee] bg-white p-7 shadow-[0_7px_22px_rgba(25,53,63,0.035)] transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(25,53,63,0.1)] md:col-span-2 [&:nth-child(4)]:md:col-start-2"
            >
              <div
                className={`grid h-12 w-12 place-items-center rounded-xl ${feature.accent} ${feature.iconColor} transition group-hover:scale-105`}
              >
                <feature.icon size={22} />
              </div>
              <h3 className="mt-6 text-lg font-bold tracking-[-0.02em]">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#70818d]">
                {feature.description}
              </p>
              <button className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-[#0D6E6E]">
                Learn more <ChevronRight size={14} />
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#e9f6f5] py-20">
        <div className="mx-auto max-w-[1080px] px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0D6E6E]">
              A simpler way forward
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#1A2B3C] sm:text-5xl">
              Up and Running in Minutes
            </h2>
          </div>
          <div className="mt-14 grid gap-9 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative text-center md:text-left">
                <div className="flex items-center gap-4 md:block">
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-bold ${
                      i === 0
                        ? 'bg-[#0D6E6E] text-white'
                        : 'border-2 border-[#0D6E6E] bg-white text-[#0D6E6E]'
                    }`}
                  >
                    {step.number}
                  </span>
                  {i < steps.length - 1 && (
                    <div className="hidden h-px flex-1 bg-[#a4d5d1] md:block" />
                  )}
                </div>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#607b83]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="bg-[#0D6E6E] text-white">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
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
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF6B6B]">
              Patient-first teams
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
              What Our Clients Say
            </h2>
          </div>
          <button className="inline-flex items-center gap-2 text-sm font-bold text-[#0D6E6E]">
            Read all stories <ArrowRight size={15} />
          </button>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-2xl border border-[#e5eeee] bg-white p-7 shadow-[0_7px_22px_rgba(25,53,63,0.035)]"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex gap-1 text-[#FF6B6B]"
                  aria-label="5 out of 5 stars"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>&#9733;</span>
                  ))}
                </div>
                <span className="text-xs font-medium text-[#94a0a8]">
                  Verified client
                </span>
              </div>
              <blockquote className="mt-7 text-[17px] font-medium leading-7 text-[#324858]">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-8 flex items-center gap-3 border-t border-[#edf1f1] pt-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#dcefee] text-xs font-bold text-[#0D6E6E]">
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-sm font-bold">{testimonial.name}</p>
                  <p className="mt-0.5 text-xs text-[#84939b]">
                    {testimonial.role}, {testimonial.clinic}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Pricing section */}
      <section className="bg-[#f0f7f7] py-24 lg:py-32">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0D6E6E]">
              Plans that grow with you
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-5 text-lg text-[#70818d]">
              Start small, grow confidently, and only pay for what you need.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-[1050px] gap-5 lg:grid-cols-3">
            {demoSubscriptionTiers.map((tier) => {
              const isEnterprise = tier.name === 'Enterprise';
              const priceDisplay = isEnterprise ? 'Custom' : formatPHP(tier.priceCents);

              return (
                <article
                  key={tier.id}
                  className={`relative rounded-2xl border bg-white p-8 ${
                    tier.isHighlighted
                      ? 'border-[#0D6E6E] shadow-[0_16px_40px_rgba(13,110,110,0.15)]'
                      : 'border-[#e1ebeb] shadow-[0_7px_22px_rgba(25,53,63,0.035)]'
                  }`}
                >
                  {tier.isHighlighted && (
                    <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-[#0D6E6E] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                      Most Popular
                    </span>
                  )}
                  <p className="text-lg font-bold">{tier.name}</p>
                  <p className="mt-2 text-sm text-[#768792]">{tier.description}</p>
                  <p className="mt-7 text-4xl font-bold tracking-[-0.06em]">
                    {priceDisplay}
                    {!isEnterprise && (
                      <span className="text-sm font-medium tracking-normal text-[#87949c]">
                        /mo
                      </span>
                    )}
                  </p>
                  <ul className="mt-7 space-y-4 border-t border-[#edf0f0] pt-6">
                    {tier.features.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-sm text-[#526673]"
                      >
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e6f4f3] text-[#0D6E6E]">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={onSignUp}
                    className={`mt-8 flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition ${
                      tier.isHighlighted
                        ? 'bg-[#0D6E6E] text-white hover:bg-[#095a5a]'
                        : 'border border-[#b8d0d0] text-[#0D6E6E] hover:bg-[#edf8f7]'
                    }`}
                  >
                    {isEnterprise ? 'Contact Sales' : 'Get Started'}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="mx-auto max-w-[1240px] px-6 py-20 lg:px-8">
        <div className="rounded-[28px] bg-[linear-gradient(115deg,#0b6263,#0D6E6E_55%,#398d87)] px-6 py-16 text-center text-white shadow-[0_20px_50px_rgba(13,110,110,0.2)] sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b8e5e1]">
            Your best work starts here
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-bold tracking-[-0.05em] sm:text-5xl">
            Ready to Transform Your Practice?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-[#d0eeeb]">
            Join 500+ clinics already using MediSmile to deliver better patient care.
          </p>
          <p className="mx-auto mt-3 flex items-center justify-center gap-1.5 text-xs text-[#b8e5e1]">
            <ShieldCheck size={14} /> HIPAA-compliant &middot; Secure &middot; Trusted
          </p>
          <button
            onClick={onSignUp}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#0D6E6E] transition hover:bg-[#edfaf9]"
          >
            Start Your Free Trial <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Demo modal */}
      {demoOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#1A2B3C]/40 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-title"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#FF6B6B]">
                  A quick look inside
                </p>
                <h2
                  id="demo-title"
                  className="mt-2 text-2xl font-bold"
                >
                  MediSmile in action
                </h2>
              </div>
              <button
                onClick={() => setDemoOpen(false)}
                aria-label="Close demo"
                className="rounded-full p-2 text-[#71828c] hover:bg-[#f2f7f7]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 rounded-2xl bg-[#e8f5f4] p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0D6E6E] text-white">
                  <Clock3 size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold">Save your team 8+ hours</p>
                  <p className="mt-1 text-xs text-[#607b83]">
                    Every week, on the work that matters.
                  </p>
                </div>
              </div>
              <div className="mt-5 h-2 rounded-full bg-[#b4dcd8]">
                <div className="h-2 w-4/5 rounded-full bg-[#0D6E6E]" />
              </div>
            </div>
            <p className="mt-6 text-sm leading-6 text-[#70818d]">
              See how scheduling, records, and billing come together in one clear
              workspace built for care teams.
            </p>
            <button
              onClick={() => setDemoOpen(false)}
              className="mt-7 w-full rounded-full bg-[#0D6E6E] py-3.5 text-sm font-bold text-white hover:bg-[#095a5a]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
