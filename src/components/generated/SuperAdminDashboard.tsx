import { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock3,
  TrendingUp,
  DollarSign,
  Calendar,
  Shield,
  Eye,
  ChevronRight,
  Search,
  Check,
  X,
  AlertTriangle,
  Edit3,
  Save,
  BarChart3,
  Activity,
} from 'lucide-react';
import { formatPHP, formatPHPShort } from '../../lib/currency';
import { DashboardStats, fetchAdminStats, fetchPendingDoctors, fetchSubscriptionTiers, fetchUserTargets, PendingDoctor, SubscriptionTier, updateProfileStatus, updateSubscriptionTier, UserTarget } from '../../lib/live-data';
import { useAuth } from '../../lib/auth-context';
import type { AuthUser } from '../../lib/auth-context';
import { useSiteContent } from '../../lib/site-content-context';

type TabId = 'overview' | 'approvals' | 'subscriptions' | 'content' | 'impersonate';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'approvals', label: 'Doctor Approvals', icon: UserCheck },
  { id: 'subscriptions', label: 'Subscriptions', icon: DollarSign },
  { id: 'content', label: 'Site Content', icon: Edit3 },
  { id: 'impersonate', label: 'Impersonate', icon: Eye },
];

const RECENT_ACTIVITY = [
  { text: 'Dr. Maria Santos approved as new practitioner', time: '2 hours ago', icon: UserCheck },
  { text: 'New patient Marcus Reyes registered', time: '4 hours ago', icon: Users },
  { text: 'Invoice INV-1042 marked as Paid', time: '5 hours ago', icon: DollarSign },
  { text: 'Dr. Angela Cruz updated clinic schedule', time: '1 day ago', icon: Calendar },
  { text: 'Subscription tier "Growth" pricing updated', time: '2 days ago', icon: TrendingUp },
];

const cardClass = 'rounded-2xl border border-[#e7eeee] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.07)]';

export default function SuperAdminDashboard({ adminName }: { adminName?: string }) {
  const { startImpersonation } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalPatients: 0, activeDoctors: 0, appointmentsThisMonth: 0, revenueCents: 0, monthlyRevenue: [] });
  const [impersonateTargets, setImpersonateTargets] = useState<UserTarget[]>([]);
  const [loadError, setLoadError] = useState('');

  // Subscription editing state
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [tierEdits, setTierEdits] = useState<Record<string, { name: string; priceCents: number; description: string }>>({});
  const [localTiers, setLocalTiers] = useState<SubscriptionTier[]>([]);

  // Site content via shared context
  const { content: siteContent, updateContent, updateStat, saveContent } = useSiteContent();
  const [contentSaved, setContentSaved] = useState(false);

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchPendingDoctors(), fetchSubscriptionTiers(), fetchUserTargets()])
      .then(([nextStats, nextDoctors, nextTiers, nextTargets]) => {
        setStats(nextStats);
        setPendingDoctors(nextDoctors);
        setLocalTiers(nextTiers);
        setImpersonateTargets(nextTargets);
      })
      .catch((error: Error) => setLoadError(error.message));
  }, []);

  // Approval handlers
  const handleApproval = async (id: string, decision: 'approved' | 'rejected') => {
    const doctor = pendingDoctors.find((item) => item.id === id);
    if (!doctor) return;
    try {
      await updateProfileStatus(doctor.profileId, decision);
      setPendingDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, status: decision } : d)));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to update approval.');
    }
  };

  // Subscription edit handlers
  const startEditTier = (tier: (typeof localTiers)[number]) => {
    setEditingTierId(tier.id);
    setTierEdits((prev) => ({
      ...prev,
      [tier.id]: { name: tier.name, priceCents: tier.priceCents, description: tier.description },
    }));
  };

  const saveTierEdit = (tierId: string) => {
    const edits = tierEdits[tierId];
    if (!edits) return;
    updateSubscriptionTier(tierId, edits).then(() => {
      setLocalTiers((prev) => prev.map((t) => (t.id === tierId ? { ...t, ...edits } : t)));
      setEditingTierId(null);
    }).catch((error: Error) => setLoadError(error.message));
  };

  const cancelTierEdit = () => {
    setEditingTierId(null);
  };

  // Site content save
  const handleSaveContent = async () => {
    try {
      await saveContent();
      setContentSaved(true);
      setTimeout(() => setContentSaved(false), 3000);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to save site content.');
    }
  };

  // Impersonation targets
  const impersonationUsers = impersonateTargets.map((target) => ({ ...target, roleLabel: target.role === 'patient' ? 'Patient' : 'Doctor / Subscriber', authUser: { id: target.id, email: target.email, fullName: target.name, role: target.role, status: target.status } }));

  // Bar chart max
  const maxRevenue = Math.max(...stats.monthlyRevenue.map((m) => m.value), 1);

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="border-b border-[#e7eeee] bg-white px-4 py-5 sm:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2B3C]">SuperAdmin Dashboard</h1>
            <p className="mt-1 text-sm text-[#1A2B3C]/60">
              Welcome back{adminName ? `, ${adminName}` : ''}. Manage the entire MediSmile platform from here.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-[#0D6E6E]/10 px-4 py-2">
            <Shield className="h-4 w-4 text-[#0D6E6E]" />
            <span className="text-sm font-medium text-[#0D6E6E]">Super Admin Access</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[#e7eeee] bg-white px-4 sm:px-8">
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Dashboard tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-[#0D6E6E] text-[#0D6E6E]'
                    : 'border-transparent text-[#1A2B3C]/50 hover:border-[#0D6E6E]/30 hover:text-[#1A2B3C]/80'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-8">
        {loadError && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Unable to load live admin data: {loadError}</div>}
        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Users} iconBg="bg-blue-100" iconColor="text-blue-600" value={stats.totalPatients.toString()} label="Total Patients" />
              <StatCard icon={UserCheck} iconBg="bg-emerald-100" iconColor="text-emerald-600" value={stats.activeDoctors.toString()} label="Active Doctors" />
              <StatCard icon={Calendar} iconBg="bg-violet-100" iconColor="text-violet-600" value={stats.appointmentsThisMonth.toString()} label="Appointments This Month" />
              <StatCard icon={DollarSign} iconBg="bg-amber-100" iconColor="text-amber-600" value={formatPHPShort(stats.revenueCents)} label="Revenue (Paid)" />
            </div>

            {/* Bar Chart */}
            <div className={cardClass}>
              <div className="mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#0D6E6E]" />
                <h2 className="text-lg font-semibold text-[#1A2B3C]">Monthly Revenue</h2>
              </div>
              <div className="flex items-end gap-3 sm:gap-6" style={{ height: 200 }}>
                {stats.monthlyRevenue.map((m) => {
                  const heightPct = (m.value / maxRevenue) * 100;
                  return (
                    <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                      <span className="text-xs font-medium text-[#1A2B3C]/60">
                        {formatPHPShort(m.value)}
                      </span>
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className="w-full rounded-t-lg transition-all"
                          style={{
                            height: `${heightPct}%`,
                            backgroundColor: '#0D6E6E',
                            minHeight: 4,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#1A2B3C]/70">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className={cardClass}>
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#0D6E6E]" />
                <h2 className="text-lg font-semibold text-[#1A2B3C]">Recent Activity</h2>
              </div>
              <ul className="divide-y divide-[#e7eeee]">
                {RECENT_ACTIVITY.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex items-center gap-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0D6E6E]/10">
                        <Icon className="h-4 w-4 text-[#0D6E6E]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1A2B3C] truncate">{item.text}</p>
                      </div>
                      <span className="shrink-0 text-xs text-[#1A2B3C]/50">{item.time}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* ===== DOCTOR APPROVALS TAB ===== */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-[#0D6E6E]" />
              <h2 className="text-lg font-semibold text-[#1A2B3C]">Pending Doctor Approvals</h2>
              <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                {pendingDoctors.filter((d) => d.status === 'pending').length} pending
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {pendingDoctors.map((doctor) => (
                <div key={doctor.id} className={cardClass}>
                  {/* Status banner */}
                  {doctor.status !== 'pending' && (
                    <div
                      className={`-mx-6 -mt-6 mb-4 rounded-t-2xl px-6 py-2 text-center text-sm font-medium ${
                        doctor.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {doctor.status === 'approved' ? 'Approved' : 'Rejected'}
                    </div>
                  )}

                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-[#1A2B3C]">{doctor.name}</h3>
                      <p className="text-sm text-[#1A2B3C]/60">{doctor.email}</p>
                    </div>
                    <span className="rounded-lg bg-[#0D6E6E]/10 px-2.5 py-1 text-xs font-medium text-[#0D6E6E]">
                      {doctor.specialty}
                    </span>
                  </div>

                  {/* PRC License - prominent */}
                  <div className="mb-4 rounded-xl border border-[#e7eeee] bg-[#F8FAFB] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#0D6E6E]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#1A2B3C]/50">PRC License Verification</span>
                    </div>
                    <p className="text-lg font-bold text-[#1A2B3C]">{doctor.prcLicense}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs text-amber-600">Pending verification</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-[#1A2B3C]/70">
                    <div className="flex justify-between">
                      <span>Medical Degree</span>
                      <span className="font-medium text-[#1A2B3C]">{doctor.medicalDegree}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Submitted</span>
                      <span className="font-medium text-[#1A2B3C]">{doctor.submittedDate}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {doctor.status === 'pending' && (
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => handleApproval(doctor.id, 'approved')}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(doctor.id, 'rejected')}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== SUBSCRIPTIONS TAB ===== */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#0D6E6E]" />
              <h2 className="text-lg font-semibold text-[#1A2B3C]">Subscription Tiers</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {localTiers.map((tier) => {
                const isEditing = editingTierId === tier.id;
                const edits = tierEdits[tier.id];

                return (
                  <div
                    key={tier.id}
                    className={`${cardClass} relative ${tier.isHighlighted ? 'ring-2 ring-[#0D6E6E]' : ''}`}
                  >
                    {/* Most Popular badge */}
                    {tier.isHighlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0D6E6E] px-4 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </div>
                    )}

                    {isEditing && edits ? (
                      /* Edit mode */
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[#1A2B3C]/60">Tier Name</label>
                          <input
                            type="text"
                            value={edits.name}
                            onChange={(e) =>
                              setTierEdits((prev) => ({ ...prev, [tier.id]: { ...prev[tier.id], name: e.target.value } }))
                            }
                            className="w-full rounded-lg border border-[#e7eeee] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[#1A2B3C]/60">Price (centavos)</label>
                          <input
                            type="number"
                            value={edits.priceCents}
                            onChange={(e) =>
                              setTierEdits((prev) => ({
                                ...prev,
                                [tier.id]: { ...prev[tier.id], priceCents: parseInt(e.target.value) || 0 },
                              }))
                            }
                            className="w-full rounded-lg border border-[#e7eeee] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[#1A2B3C]/60">Description</label>
                          <input
                            type="text"
                            value={edits.description}
                            onChange={(e) =>
                              setTierEdits((prev) => ({
                                ...prev,
                                [tier.id]: { ...prev[tier.id], description: e.target.value },
                              }))
                            }
                            className="w-full rounded-lg border border-[#e7eeee] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveTierEdit(tier.id)}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0D6E6E] px-3 py-2 text-sm font-medium text-white hover:bg-[#0B5C5C]"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </button>
                          <button
                            onClick={cancelTierEdit}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e7eeee] bg-white px-3 py-2 text-sm font-medium text-[#1A2B3C]/70 hover:bg-[#F8FAFB]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <>
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-[#1A2B3C]">{tier.name}</h3>
                          <div className="mt-2">
                            {tier.priceCents > 0 ? (
                              <span className="text-3xl font-bold text-[#0D6E6E]">
                                {formatPHP(tier.priceCents)}
                                <span className="text-sm font-normal text-[#1A2B3C]/50">/mo</span>
                              </span>
                            ) : (
                              <span className="text-2xl font-bold text-[#0D6E6E]">Custom Pricing</span>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-[#1A2B3C]/60">{tier.description}</p>
                        </div>

                        <div className="mb-4 text-sm text-[#1A2B3C]/60">
                          Max practitioners:{' '}
                          <span className="font-medium text-[#1A2B3C]">
                            {tier.maxPractitioners ?? 'Unlimited'}
                          </span>
                        </div>

                        <ul className="mb-5 space-y-2">
                          {tier.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[#1A2B3C]/80">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0D6E6E]" />
                              {f}
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => startEditTier(tier)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#e7eeee] bg-white px-4 py-2.5 text-sm font-medium text-[#1A2B3C]/70 transition-colors hover:bg-[#F8FAFB]"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit Tier
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== SITE CONTENT TAB ===== */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-[#0D6E6E]" />
              <h2 className="text-lg font-semibold text-[#1A2B3C]">Site Content Management</h2>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Changes will appear on the public website once saved.
            </div>

            {/* Hero Section */}
            <div className={cardClass}>
              <h3 className="mb-4 text-base font-semibold text-[#1A2B3C]">Hero Section</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A2B3C]/60">Headline</label>
                  <input
                    type="text"
                    value={siteContent.hero.headline}
                    onChange={(e) => updateContent('hero.headline', e.target.value)}
                    className="w-full rounded-lg border border-[#e7eeee] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A2B3C]/60">Subheadline</label>
                  <input
                    type="text"
                    value={siteContent.hero.subheadline}
                    onChange={(e) => updateContent('hero.subheadline', e.target.value)}
                    className="w-full rounded-lg border border-[#e7eeee] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A2B3C]/60">CTA Button Text</label>
                  <input
                    type="text"
                    value={siteContent.hero.cta_text}
                    onChange={(e) => updateContent('hero.cta_text', e.target.value)}
                    className="w-full rounded-lg border border-[#e7eeee] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]"
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className={cardClass}>
              <h3 className="mb-4 text-base font-semibold text-[#1A2B3C]">Stats Bar</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {siteContent.stats.map((stat, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-[#1A2B3C]/60">Number</label>
                      <input
                        type="text"
                        value={stat.number}
                        onChange={(e) => updateStat(i, 'number', e.target.value)}
                        className="w-full rounded-lg border border-[#e7eeee] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-[#1A2B3C]/60">Label</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => updateStat(i, 'label', e.target.value)}
                        className="w-full rounded-lg border border-[#e7eeee] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className={cardClass}>
              <h3 className="mb-4 text-base font-semibold text-[#1A2B3C]">Contact Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A2B3C]/60">Phone</label>
                  <input
                    type="text"
                    value={siteContent.contact.phone}
                    onChange={(e) => updateContent('contact.phone', e.target.value)}
                    className="w-full rounded-lg border border-[#e7eeee] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A2B3C]/60">Email</label>
                  <input
                    type="text"
                    value={siteContent.contact.email}
                    onChange={(e) => updateContent('contact.email', e.target.value)}
                    className="w-full rounded-lg border border-[#e7eeee] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#1A2B3C]/60">Address</label>
                  <input
                    type="text"
                    value={siteContent.contact.address}
                    onChange={(e) => updateContent('contact.address', e.target.value)}
                    className="w-full rounded-lg border border-[#e7eeee] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className={cardClass}>
              <h3 className="mb-4 text-base font-semibold text-[#1A2B3C]">Social Links</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A2B3C]/60">Facebook</label>
                  <input
                    type="text"
                    value={siteContent.contact.facebook}
                    onChange={(e) => updateContent('contact.facebook', e.target.value)}
                    className="w-full rounded-lg border border-[#e7eeee] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A2B3C]/60">Instagram</label>
                  <input
                    type="text"
                    value={siteContent.contact.instagram}
                    onChange={(e) => updateContent('contact.instagram', e.target.value)}
                    className="w-full rounded-lg border border-[#e7eeee] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A2B3C]/60">LinkedIn</label>
                  <input
                    type="text"
                    value={siteContent.contact.linkedin}
                    onChange={(e) => updateContent('contact.linkedin', e.target.value)}
                    className="w-full rounded-lg border border-[#e7eeee] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]"
                  />
                </div>
              </div>
            </div>

            {/* Save Button & Toast */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveContent}
                className="flex items-center gap-2 rounded-xl bg-[#0D6E6E] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0B5C5C]"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
              {contentSaved && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <Check className="h-4 w-4" />
                  Changes saved successfully!
                </span>
              )}
            </div>
          </div>
        )}

        {/* ===== IMPERSONATE TAB ===== */}
        {activeTab === 'impersonate' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#0D6E6E]" />
              <h2 className="text-lg font-semibold text-[#1A2B3C]">Impersonate User</h2>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-700">
                You will see the app as this user. Click &quot;Return to Admin&quot; in the top banner to stop.
              </p>
            </div>

            <div className={cardClass}>
              {/* Search placeholder */}
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#e7eeee] px-3 py-2">
                <Search className="h-4 w-4 text-[#1A2B3C]/40" />
                <span className="text-sm text-[#1A2B3C]/40">Search users...</span>
              </div>

              <div className="divide-y divide-[#e7eeee]">
                {impersonationUsers.map((target) => (
                  <div key={i} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0D6E6E]/10 text-sm font-semibold text-[#0D6E6E]">
                        {target.name
                          .replace(/Dr\.\s?/, '')
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A2B3C]">{target.name}</p>
                        <p className="text-xs text-[#1A2B3C]/50">{target.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                          target.role === 'patient'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {target.roleLabel}
                      </span>
                      <button
                        onClick={() => startImpersonation(target.authUser)}
                        className="flex items-center gap-1.5 rounded-xl bg-[#0D6E6E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0B5C5C]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View As
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Stat Card Sub-component ---------- */

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
}) {
  return (
    <div className={cardClass}>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#1A2B3C]">{value}</p>
          <p className="text-sm text-[#1A2B3C]/60">{label}</p>
        </div>
      </div>
    </div>
  );
}
