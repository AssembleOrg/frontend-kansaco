// /features/auth/store/authStore.ts
import { create } from 'zustand';
import { AuthState, LoginPayload, ActualLoginApiResponse } from '@/types';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { loginUser } from '@/lib/api';

// Helper - localStorage está disponible
const isLocalStorageAvailable = () => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem('zustand-test', 'test');
    window.localStorage.removeItem('zustand-test');
    return true;
  } catch (e) {
    return false;
  }
};

//  depuración - estado del localStorage
const debugStorage = () => {
  if (!isLocalStorageAvailable()) return null;

  try {
    const storageContent = localStorage.getItem('auth-storage');
    if (storageContent) {
      return JSON.parse(storageContent);
    }
    return null;
  } catch (e) {
    console.error('Error reading localStorage:', e);
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: async (payload: LoginPayload): Promise<boolean> => {
        console.log('Login attempt started', payload);
        set({ isLoading: true, error: null });
        try {
          console.log('Calling API');
          const response: ActualLoginApiResponse = await loginUser(payload);
          console.log('API response:', response);

          const responseToken = response.data?.token || null;
          const userFromResponse = response.data?.user || null;

          console.log(
            'Token found in response.data:',
            responseToken ? 'Yes' : 'No'
          );
          console.log(
            'User found in response.data:',
            userFromResponse ? 'Yes' : 'No'
          );
          console.log('Setting token:', responseToken ? 'has value' : 'null');
          console.log('Setting user:', userFromResponse ? 'has data' : 'null');

          set({
            user: userFromResponse,
            token: responseToken,
            isLoading: false,
            error: null,
          });

          setTimeout(() => {
            const storageState = debugStorage();
            console.log('Storage state after login:', storageState);
          }, 500);
          return true;
        } catch (error) {
          console.error('Login error:', error);
          set({
            user: null,
            token: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
          });
          return false;
        }
      },
      logout: () => {
        set({ user: null, token: null, isLoading: false, error: null });
      },
      setToken: (token: string | null) => {
        set({ token });
      },
      setUser: (user: User | null) => {
        set({ user });
      },
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        return isLocalStorageAvailable()
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => null,
              removeItem: () => null,
            };
      }),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      skipHydration: false,
    }
  )
);
