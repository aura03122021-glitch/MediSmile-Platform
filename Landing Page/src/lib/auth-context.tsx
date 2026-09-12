import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from './supabase';

export type Role = 'super_admin' | 'subscriber' | 'patient';
export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: AccountStatus;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isDemoMode: boolean;
  impersonating: AuthUser | null;
  signUp: (email: string, password: string, fullName: string, role: Role) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  demoSignIn: (role: Role) => void;
  startImpersonation: (targetUser: AuthUser) => void;
  stopImpersonation: () => void;
  activeUser: AuthUser | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<Role, AuthUser> = {
  patient: { id: 'demo-patient', email: 'patient@demo.medismile.ph', fullName: 'Juan Dela Cruz', role: 'patient', status: 'approved' },
  subscriber: { id: 'demo-subscriber', email: 'doctor@demo.medismile.ph', fullName: 'Dr. Maria Santos', role: 'subscriber', status: 'approved' },
  super_admin: { id: 'demo-admin', email: 'admin@demo.medismile.ph', fullName: 'Admin', role: 'super_admin', status: 'approved' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id).then(setUser);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id).then(setUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string): Promise<AuthUser | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, status, avatar_url')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role as Role,
      status: data.status as AccountStatus,
      avatarUrl: data.avatar_url,
    };
  }

  const signUp = useCallback(async (email: string, password: string, fullName: string, role: Role): Promise<{ error?: string }> => {
    if (isDemoMode) return { error: 'Supabase not configured. Use demo sign-in.' };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (error) return { error: error.message };
    return {};
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    if (isDemoMode) return { error: 'Supabase not configured. Use demo sign-in.' };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signOut = useCallback(async () => {
    setImpersonating(null);
    if (isDemoMode) {
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const demoSignIn = useCallback((role: Role) => {
    setUser(DEMO_USERS[role]);
  }, []);

  const startImpersonation = useCallback((targetUser: AuthUser) => {
    if (user?.role !== 'super_admin') return;
    setImpersonating(targetUser);
  }, [user]);

  const stopImpersonation = useCallback(() => {
    setImpersonating(null);
  }, []);

  const activeUser = impersonating ?? user;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isDemoMode,
      impersonating,
      signUp,
      signIn,
      signOut,
      demoSignIn,
      startImpersonation,
      stopImpersonation,
      activeUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
