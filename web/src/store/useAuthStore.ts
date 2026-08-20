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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      activeTenant: null,
      isSuperAdmin: false,

      setUser: (user) => set({ user, isSuperAdmin: checkIsSuperAdmin(user) }),
      setSession: (session) =>
        set({
          session,
          user: session?.user ?? null,
          isSuperAdmin: checkIsSuperAdmin(session?.user ?? null),
        }),
      setActiveTenant: (tenant) => set({ activeTenant: tenant }),
      clearActiveTenant: () => set({ activeTenant: null }),

      initializeAuth: () => {
        set({ isLoading: true });

        // 1. Obtener la sesión actual almacenada
        supabase.auth.getSession().then(({ data: { session } }) => {
          const user = session?.user ?? null;
          set({
            session,
            user,
            isSuperAdmin: checkIsSuperAdmin(user),
            isLoading: false,
          });
        });

        // 2. Suscribirse a cambios en el estado de autenticación
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          const user = session?.user ?? null;
          set({
            session,
            user,
            isSuperAdmin: checkIsSuperAdmin(user),
            isLoading: false,
          });
        });

        return () => {
          subscription.unsubscribe();
        };
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
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
