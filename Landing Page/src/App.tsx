import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { SiteContentProvider } from './lib/site-content-context';

const MediSmileLanding = lazy(() => import('./components/generated/MediSmileLanding'));
const DoctorClinicLanding = lazy(() => import('./components/marketing/DoctorClinicLanding'));
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const AppShell = lazy(() => import('./components/layout/AppShell'));
const SuperAdminDashboard = lazy(() => import('./components/generated/SuperAdminDashboard'));
const PatientPortalHome = lazy(() => import('./components/patient/PatientPortalHome'));
const DoctorProfile = lazy(() => import('./components/patient/DoctorProfile'));
const BookingAppointment = lazy(() => import('./components/generated/AppointmentBooking'));
const PatientRecords = lazy(() => import('./components/generated/PatientRecords'));
const Billings = lazy(() => import('./components/generated/BillingInvoicing'));

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFB]">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#0D6E6E] border-t-transparent" />
        <p className="mt-3 text-sm text-[#607181]">Loading...</p>
      </div>
    </div>
  );
}

type AppRoute =
  | { page: 'home' }
  | { page: 'for-providers' }
  | { page: 'login' }
  | { page: 'portal'; view: string; doctorId?: string };

function AppRouter() {
  const { user, activeUser, loading } = useAuth();
  const [route, setRoute] = useState<AppRoute>(parseRoute());

  useEffect(() => {
    function onPopState() { setRoute(parseRoute()); }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function navigate(path: string) {
    window.history.pushState({}, '', path);
    setRoute(parseRoute(path));
  }

  useEffect(() => {
    if (user && route.page === 'login') {
      const defaultView = getDefaultView(activeUser!.role);
      navigate(`/portal/${defaultView}`);
    }
  }, [user]);

  if (loading) return <Loading />;

  return (
    <Suspense fallback={<Loading />}>
      {renderRoute()}
    </Suspense>
  );

  function renderRoute() {
    switch (route.page) {
      case 'home':
        return <MediSmileLanding onNavigate={navigate} />;

      case 'for-providers':
        return <DoctorClinicLanding onSignUp={() => navigate('/login?role=subscriber')} />;

      case 'login':
        if (user) {
          const defaultView = getDefaultView(activeUser!.role);
          return renderPortal(defaultView);
        }
        return <LoginPage onNavigate={navigate} />;

      case 'portal':
        if (!user) return <LoginPage onNavigate={navigate} />;
        if (activeUser!.status === 'pending' && activeUser!.role === 'subscriber') {
          return <PendingApproval onSignOut={() => { navigate('/'); }} />;
        }
        return renderPortal(route.view, route.doctorId);
    }
  }

  function renderPortal(view: string, doctorId?: string) {
    if (!activeUser) return <LoginPage onNavigate={navigate} />;

    return (
      <AppShell activeView={view} onNavigate={(v) => navigate(`/portal/${v}`)}>
        {renderPortalView(view, doctorId)}
      </AppShell>
    );
  }

  function renderPortalView(view: string, doctorId?: string) {
    if (!activeUser) return null;

    switch (activeUser.role) {
      case 'super_admin':
        return <SuperAdminDashboard adminName={activeUser.fullName} />;

      case 'subscriber':
        switch (view) {
          case 'billing': return <Billings />;
          case 'schedule': return <BookingAppointment />;
          case 'patients':
          default: return <PatientRecords doctorProfileId={activeUser.id} />;
        }

      case 'patient':
      default:
        switch (view) {
          case 'booking':
            return <BookingAppointment doctorId={doctorId} />;
          case 'doctor-profile':
            return (
              <DoctorProfile
                doctorId={doctorId ?? ''}
                onBack={() => navigate('/portal/home')}
                onBookAppointment={(id) => navigate(`/portal/booking?doctor=${id}`)}
              />
            );
          case 'home':
          default:
            return (
              <PatientPortalHome
                onBookDoctor={(id) => navigate(`/portal/doctor-profile/${id}`)}
              />
            );
        }
    }
  }
}

function PendingApproval({ onSignOut }: { onSignOut: () => void }) {
  const { signOut } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFB] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#e5f0ef] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#fff3cd] text-[#b97812]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7">
            <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#1A2B3C]">Account Pending Approval</h2>
        <p className="mt-3 text-sm leading-6 text-[#607181]">
          Your clinic/doctor account is currently under review. A MediSmile administrator will verify your credentials and activate your account. You'll receive an email notification once approved.
        </p>
        <button onClick={async () => { await signOut(); onSignOut(); }}
          className="mt-6 rounded-xl border border-[#dce8e8] px-6 py-2.5 text-sm font-semibold text-[#607181] hover:bg-[#f8fafb]">
          Sign Out
        </button>
      </div>
    </div>
  );
}

function parseRoute(path?: string): AppRoute {
  const pathname = path ?? window.location.pathname;
  const search = path ? '' : window.location.search;
  if (pathname === '/for-providers') return { page: 'for-providers' };
  if (pathname === '/login') return { page: 'login' };
  if (pathname.startsWith('/portal')) {
    const parts = pathname.replace('/portal', '').split('/').filter(Boolean);
    const view = parts[0] || 'home';
    const doctorId = view === 'doctor-profile' ? parts[1] : new URLSearchParams(search).get('doctor') ?? undefined;
    return { page: 'portal', view, doctorId };
  }
  return { page: 'home' };
}

function getDefaultView(role: string): string {
  switch (role) {
    case 'super_admin': return 'dashboard';
    case 'subscriber': return 'patients';
    case 'patient':
    default: return 'home';
  }
}

export default function App() {
  return (
    <SiteContentProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </SiteContentProvider>
  );
}
