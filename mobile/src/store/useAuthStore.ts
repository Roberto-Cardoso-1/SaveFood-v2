import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  tipo_perfil: 'Doador' | 'Receptor';
}

interface AuthState {
  user: User | null;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  setHydrated: (v: boolean) => void;
  logout: () => void;
}

/**
 * Store de sessão.
 *
 * Importante: os **tokens** JWT são guardados no SecureStore (ver `services/auth.ts`),
 * não aqui. Esta store guarda apenas o usuário, para a UI saber se está logado
 * sem precisar bater na API a cada render.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      updateUser: (data) =>
        set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),
      setHydrated: (v) => set({ hasHydrated: v }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'savefood:auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
