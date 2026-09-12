import { useState } from 'react';
import { useAuth, Role } from '../../lib/auth-context';
import { Stethoscope, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const { signIn, signUp, demoSignIn, isDemoMode } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      if (!fullName.trim()) { setError('Full name is required.'); setLoading(false); return; }
      if (password.length < 8) { setError('Password must be at least 8 characters.'); setLoading(false); return; }
      if (passwordStrength < 2) { setError('Password is too weak. Include uppercase, lowercase, numbers, and symbols.'); setLoading(false); return; }

      const { error: err } = await signUp(email, password, fullName.trim(), role);
      if (err) { setError(err); setLoading(false); return; }

      setSignupSuccess(true);
    } else {
      const { error: err } = await signIn(email, password);
      if (err) { setError(err); }
    }
    setLoading(false);
  }

  if (signupSuccess) {
    const isSubscriber = role === 'subscriber';
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFB] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#e5f0ef] bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#e5f4f3] text-[#0D6E6E]">
            <Stethoscope size={24} />
          </div>
          <h2 className="text-xl font-bold text-[#1A2B3C]">
            {isSubscriber ? 'Application Submitted' : 'Check Your Email'}
          </h2>
          <p className="mt-3 text-sm text-[#607181] leading-6">
            {isSubscriber
              ? "Your clinic/doctor account is pending approval. A MediSmile administrator will review your credentials and activate your account. You'll receive an email once approved."
              : `We've sent a confirmation link to ${email}. Click the link in that email to activate your account, then come back here to sign in.`}
          </p>
          <button onClick={() => onNavigate('/')} className="mt-6 rounded-xl bg-[#0D6E6E] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#095a5a]">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFB] px-4">
      <div className="w-full max-w-md">
        <button onClick={() => onNavigate('/')} className="mb-6 flex items-center gap-2 text-sm font-medium text-[#607181] hover:text-[#0D6E6E]">
          <ArrowLeft size={16} /> Back to home
        </button>

        <div className="rounded-2xl border border-[#e5f0ef] bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0D6E6E] text-white">
              <Stethoscope size={19} />
            </div>
            <div>
              <p className="text-lg font-bold text-[#1A2B3C]">MediSmile</p>
              <p className="text-xs text-[#607181]">{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">Full Name</label>
                  <input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                    placeholder="Juan Dela Cruz" className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm text-[#1A2B3C] placeholder:text-[#9aa8b0] focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
                </div>
                <div>
                  <label htmlFor="signupRole" className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">I am a...</label>
                  <select id="signupRole" value={role} onChange={e => setRole(e.target.value as Role)}
                    className="w-full rounded-xl border border-[#dce8e8] bg-white px-3.5 py-2.5 text-sm text-[#1A2B3C] focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20">
                    <option value="patient">Patient</option>
                    <option value="subscriber">Doctor / Clinic Staff</option>
                  </select>
                  {role === 'subscriber' && (
                    <p className="mt-1.5 text-xs text-[#b97812]">Doctor/Clinic accounts require admin approval before activation.</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com" className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 text-sm text-[#1A2B3C] placeholder:text-[#9aa8b0] focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#1A2B3C]">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  minLength={8} placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Enter your password'}
                  className="w-full rounded-xl border border-[#dce8e8] px-3.5 py-2.5 pr-10 text-sm text-[#1A2B3C] placeholder:text-[#9aa8b0] focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa8b0] hover:text-[#607181]" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-[#e5ebed]'}`} />
                  ))}
                  <span className="ml-2 text-[10px] font-semibold text-[#7b8b94]">{strengthLabels[passwordStrength]}</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-[#0D6E6E] py-2.5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(13,110,110,0.2)] transition hover:bg-[#095a5a] disabled:opacity-60">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#607181]">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="font-semibold text-[#0D6E6E] hover:underline">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          {isDemoMode && (
            <div className="mt-6 border-t border-[#e5ebed] pt-5">
              <p className="mb-3 text-center text-xs font-semibold text-[#b97812]">Demo Mode — Supabase not connected</p>
              <div className="flex gap-2">
                <button onClick={() => demoSignIn('patient')} className="flex-1 rounded-lg border border-[#dce8e8] py-2 text-xs font-semibold text-[#0D6E6E] hover:bg-[#f2fafa]">Patient</button>
                <button onClick={() => demoSignIn('subscriber')} className="flex-1 rounded-lg border border-[#dce8e8] py-2 text-xs font-semibold text-[#0D6E6E] hover:bg-[#f2fafa]">Doctor</button>
                <button onClick={() => demoSignIn('super_admin')} className="flex-1 rounded-lg border border-[#dce8e8] py-2 text-xs font-semibold text-[#0D6E6E] hover:bg-[#f2fafa]">Admin</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getPasswordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];