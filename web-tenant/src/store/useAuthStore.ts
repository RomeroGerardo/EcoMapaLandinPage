import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface Tenant {
  id: string;
  name: string;
  type: string;
}

export function checkIsSuperAdmin(user: User | null): boolean {
  if (!user) return false;
  const email = user.email?.toLowerCase() || '';
  const metaRole = user.user_metadata?.role;
  const appRole = user.app_metadata?.role;
  return (
    email === 'admin@ecomapa.org' ||
    email.includes('romerolabs') ||
    metaRole === 'superadmin' ||
    appRole === 'superadmin'
  );
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  activeTenant: Tenant | null;
  isSuperAdmin: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setActiveTenant: (tenant: Tenant | null) => void;
  clearActiveTenant: () => void;
  initializeAuth: () => () => void;
  signOut: () => Promise<void>;
}

export const MOCK_USER: User = {
  id: '00000000-0000-0000-0000-000000000000',
  app_metadata: { provider: 'email', providers: ['email'], role: 'superadmin' },
  user_metadata: { role: 'superadmin', name: 'Superadmin EcoMapa' },
  aud: 'authenticated',
  confirmation_sent_at: '',
  recovery_sent_at: '',
  email_change_sent_at: '',
  new_email: '',
  invited_at: '',
  action_link: '',
  email: 'admin@ecomapa.org',
  phone: '',
  created_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  phone_confirmed_at: '',
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
  identities: [],
  factors: [],
};

const DEFAULT_TENANT: Tenant = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Municipalidad Demo',
  type: 'municipality',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: MOCK_USER,
      session: null,
      isLoading: false,
      activeTenant: DEFAULT_TENANT,
      isSuperAdmin: true,

      setUser: (user) => set({ user: user ?? MOCK_USER, isSuperAdmin: true }),
      setSession: (session) =>
        set({
          session,
          user: session?.user ?? MOCK_USER,
          isSuperAdmin: true,
        }),
      setActiveTenant: (tenant) => set({ activeTenant: tenant ?? DEFAULT_TENANT }),
      clearActiveTenant: () => set({ activeTenant: null }),

      initializeAuth: () => {
        // En modo bypass directo, mantenemos el usuario activo
        try {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              set({
                session,
                user: session.user,
                isSuperAdmin: checkIsSuperAdmin(session.user),
                isLoading: false,
              });
            } else {
              set({
                user: MOCK_USER,
                isSuperAdmin: true,
                isLoading: false,
              });
            }
          }).catch(() => {
            set({
              user: MOCK_USER,
              isSuperAdmin: true,
              isLoading: false,
            });
          });

          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              set({
                session,
                user: session.user,
                isSuperAdmin: checkIsSuperAdmin(session.user),
                isLoading: false,
              });
            }
          });

          return () => {
            subscription?.unsubscribe?.();
          };
        } catch {
          set({
            user: MOCK_USER,
            isSuperAdmin: true,
            isLoading: false,
          });
          return () => {};
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore error
        } finally {
          set({
            user: null,
            session: null,
            activeTenant: null,
            isSuperAdmin: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'ecomapa-auth-storage',
      partialize: (state) => ({
        activeTenant: state.activeTenant,
      }),
    }
  )
);
