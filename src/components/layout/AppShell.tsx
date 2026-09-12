import React, { useState } from 'react';
import { Stethoscope, Menu, X, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth, Role } from '../../lib/auth-context';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const IconShield = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" strokeLinejoin="round" /></svg>;
const IconHome = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><path d="M4 11l8-7 8 7" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 9.5V20h12V9.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IconCalendar = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><rect x="4" y="5" width="16" height="15" rx="1.5" /><path d="M4 9.5h16" strokeLinecap="round" /><path d="M8 3v3M16 3v3" strokeLinecap="round" /></svg>;
const IconFile = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><path d="M6 3h8l4 4v14H6V3z" strokeLinejoin="round" /><path d="M14 3v4h4" strokeLinejoin="round" /><path d="M9 12h6M9 16h6" strokeLinecap="round" /></svg>;
const IconCard = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><rect x="3" y="6" width="18" height="13" rx="1.5" /><path d="M3 10h18" /><path d="M6 14.5h4" strokeLinecap="round" /></svg>;

const NAV_CONFIG: Record<Role, NavItem[]> = {
  super_admin: [{ id: 'dashboard', label: 'Dashboard', icon: IconShield }],
  subscriber: [
    { id: 'patients', label: 'Patient Records', icon: IconFile },
    { id: 'schedule', label: 'Appointments', icon: IconCalendar },
    { id: 'billing', label: 'Billing', icon: IconCard },
  ],
  patient: [
    { id: 'home', label: 'Find a Doctor', icon: IconHome },
    { id: 'booking', label: 'Book Appointment', icon: IconCalendar },
  ],
};

const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Super Admin Dashboard',
  patients: 'Patient Records',
  schedule: 'Appointments',
  billing: 'Billing & Invoicing',
  home: 'Find a Doctor',
  booking: 'Book an Appointment',
  'doctor-profile': 'Doctor Profile',
};

interface AppShellProps {
  activeView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export default function AppShell({ activeView, onNavigate, children }: AppShellProps) {
  const { user, activeUser, impersonating, signOut, stopImpersonation } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!activeUser) return null;
  const items = NAV_CONFIG[activeUser.role] ?? [];

  return (
    <div className="flex h-screen bg-[#F8FAFB]">
      {impersonating && (
        <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-[#b97812] px-4 py-2 text-sm font-semibold text-white">
          <span>Viewing as {impersonating.fullName} ({impersonating.role})</span>
          <button onClick={stopImpersonation} className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1 text-xs font-bold hover:bg-white/30">
            <ArrowLeft size={13} /> Return to Admin
          </button>
        </div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-800 text-slate-300 transition-transform lg:relative lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${impersonating ? 'pt-10' : ''}`}>
        <div className="flex h-16 items-center gap-2 border-b border-slate-700/60 px-6">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#0D6E6E] text-sm font-bold text-white">
            <Stethoscope size={16} />
          </div>
          <span className="font-semibold tracking-tight text-white">MediSmile</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map(item => {
            const isActive = activeView === item.id;
            return (
              <button key={item.id} onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-slate-700/70 text-teal-400' : 'text-slate-300 hover:bg-slate-700/40 hover:text-white'}`}>
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-700/60 px-3 py-4">
          <div className="mb-2 px-3 py-2">
            <p className="truncate text-sm font-medium text-white">{activeUser.fullName}</p>
            <p className="text-xs text-slate-400">{getRoleLabel(activeUser.role)}</p>
            {activeUser.status === 'pending' && (
              <p className="mt-1 text-[10px] font-bold text-yellow-400">Account Pending Approval</p>
            )}
          </div>
          <button onClick={async () => { await signOut(); window.history.pushState({}, '', '/login'); window.dispatchEvent(new PopStateEvent('popstate')); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/40 hover:text-white">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <div className={`flex flex-1 flex-col overflow-hidden ${impersonating ? 'pt-10' : ''}`}>
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white px-4 lg:px-6">
          <button className="rounded-lg p-2 text-slate-600 lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-[#1A2B3C]">{VIEW_TITLES[activeView] ?? 'MediSmile'}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

function getRoleLabel(role: Role): string {
  switch (role) {
    case 'super_admin': return 'Super Admin';
    case 'subscriber': return 'Doctor / Clinic';
    case 'patient': return 'Patient';
  }
}
