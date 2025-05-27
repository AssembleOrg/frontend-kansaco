// features/auth/store/authStore.ts
import { create } from 'zustand';
import {
  persist,
  createJSONStorage,
  devtools,
  StateStorage,
} from 'zustand/middleware';
import { User, LoginPayload, ActualLoginApiResponse } from '@/types/auth';
import { loginUser as apiLoginUser } from '@/lib/api';
import { useCartStore } from '@/features/cart/store/cartStore';

const isLocalStorageAvailable = (): StateStorage | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    window.localStorage.setItem('zustand-test', 'test');
    window.localStorage.removeItem('zustand-test');
    return localStorage;
  } catch (e) {
    console.warn('localStorage no disponible o restringido:', e);
    return undefined;
  }
};

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthReady: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (payload: LoginPayload) => Promise<ActualLoginApiResponse>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        user: null,
        isLoading: false,
        error: null,
        isAuthReady: false,

        setToken: (token) => set({ token }),
        setUser: (user) => set({ user }),

        login: async (payload) => {
          set({ isLoading: true, error: null });
          try {
            const response = await apiLoginUser(payload);
            set({
              token: response.access_token,
              user: response.user,
              isLoading: false,
              error: null,
            });
            console.log('AuthStore: Login exitoso, token y user establecidos.');

            return response;
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Error de login desconocido';
            set({ error: errorMessage, isLoading: false });
            console.error('AuthStore: Error en login:', errorMessage);
            throw error;
          }
        },

        logout: async () => {
          console.log('AuthStore: Logout iniciado.');

          const { token, cart } = useCartStore.getState();
          if (token && cart.id !== 0) {
            try {
              console.log(
                'AuthStore: (Idealmente) Carrito del servidor vaciado.'
              );
            } catch (e) {
              console.error(
                'AuthStore: Error vaciando carrito del servidor en logout',
                e
              );
            }
          }

          await useCartStore.getState().clearCart();

          set({ token: null, user: null, error: null });
          console.log(
            'AuthStore: Estado de autenticación y carrito local limpiados.'
          );
        },
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(
          () =>
            isLocalStorageAvailable() ?? {
              getItem: () => null,
              setItem: () => null,
              removeItem: () => null,
            }
        ),
        partialize: (state) => ({ token: state.token, user: state.user }),
        onRehydrateStorage: () => () => {
          useAuthStore.setState({ isAuthReady: true });
          console.log('Auth Store: Rehidratación completa. isAuthReady=true.');
        },
        // onRehydrateError: (err: unknown) => {
        //   console.error('Auth Store: Error de rehidratación:', err);
        //   // Si hay error, igual marcamos como listo para no bloquear la app,
        //   // pero el estado será el inicial (sin token/usuario).
        //   useAuthStore.setState({
        //     isAuthReady: true,
        //     token: null,
        //     user: null,
        //     error: 'Error cargando sesión.',
        //   });
        // },
      }
    )
  )
);
