// features/auth/store/authStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User, LoginPayload, LoginApiResponse } from '@/types/auth';
import { loginUser as apiLoginUser } from '@/lib/api';
import { useCartStore } from '@/features/cart/store/cartStore';
import { cookieUtils, COOKIE_NAMES } from '@/lib/cookies';
import { logger } from '@/lib/logger';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthReady: boolean;
  isInitializing: boolean;
  
  // Actions
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (payload: LoginPayload) => Promise<LoginApiResponse>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

// Mutex-like lock to prevent race conditions
let authLock = false;
const lockTimeout = 5000; // 5 seconds max lock time

const acquireLock = async (): Promise<boolean> => {
  if (authLock) {
    return false;
  }
  authLock = true;
  // Auto-release lock after timeout to prevent deadlocks
  setTimeout(() => {
    authLock = false;
  }, lockTimeout);
  return true;
};

const releaseLock = () => {
  authLock = false;
};

// Initialize from cookies (server-safe)
const initializeFromCookies = (): { token: string | null; user: User | null } => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  try {
    const token = cookieUtils.get(COOKIE_NAMES.AUTH_TOKEN);
    const userDataStr = cookieUtils.get(COOKIE_NAMES.USER_DATA);
    
    let user: User | null = null;
    if (userDataStr) {
      try {
        user = JSON.parse(userDataStr) as User;
      } catch (e) {
        logger.warn('AuthStore: Error parsing user data from cookie:', e);
        cookieUtils.remove(COOKIE_NAMES.USER_DATA);
      }
    }

    return { token, user };
  } catch (error) {
    logger.error('AuthStore: Error initializing from cookies:', error);
    return { token: null, user: null };
  }
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => {
      // Initialize immediately from cookies
      const initialState = initializeFromCookies();
      
      return {
        ...initialState,
        isLoading: false,
        error: null,
        isAuthReady: false,
        isInitializing: false,

        setToken: (token) => {
          if (!acquireLock()) {
            logger.warn('AuthStore: setToken called while locked, skipping');
            return;
          }
          try {
            set({ token });
            if (token) {
              cookieUtils.set(COOKIE_NAMES.AUTH_TOKEN, token, { expires: 7 }); // 7 days
            } else {
              cookieUtils.remove(COOKIE_NAMES.AUTH_TOKEN);
            }
          } finally {
            releaseLock();
          }
        },

        setUser: (user) => {
          if (!acquireLock()) {
            logger.warn('AuthStore: setUser called while locked, skipping');
            return;
          }
          try {
            set({ user });
            if (user) {
              cookieUtils.set(COOKIE_NAMES.USER_DATA, JSON.stringify(user), { expires: 7 });
            } else {
              cookieUtils.remove(COOKIE_NAMES.USER_DATA);
            }
          } finally {
            releaseLock();
          }
        },

        login: async (payload) => {
          if (!acquireLock()) {
            throw new Error('Authentication operation already in progress');
          }

          set({ isLoading: true, error: null });
          
          try {
            const response = await apiLoginUser(payload);
            
            // Extract token and user from nested data structure
            const token = response.data?.token;
            const user = response.data?.user;
            
            if (!token || !user) {
              logger.error('AuthStore: Invalid response structure', response);
              throw new Error('Invalid response from server');
            }
            
            // Ensure user has descuentosAplicados array (may be missing from response)
            const userWithDiscounts = {
              ...user,
              descuentosAplicados: user.descuentosAplicados || [],
            };
            
            // Update state atomically
            set({
              token,
              user: userWithDiscounts,
              isLoading: false,
              error: null,
            });
            
            // Save to cookies
            cookieUtils.set(COOKIE_NAMES.AUTH_TOKEN, token, { expires: 7 });
            cookieUtils.set(COOKIE_NAMES.USER_DATA, JSON.stringify(userWithDiscounts), { expires: 7 });
            
            logger.debug('AuthStore: Login successful', {
              userId: user.id,
              email: user.email,
              rol: user.rol,
            });
            
            return {
              token,
              user: userWithDiscounts,
            };
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Unknown login error';
            set({ error: errorMessage, isLoading: false });
            logger.error('AuthStore: Login error:', errorMessage);
            throw error;
          } finally {
            releaseLock();
          }
        },

        logout: async () => {
          if (!acquireLock()) {
            logger.warn('AuthStore: Logout called while locked, skipping');
            return;
          }

          try {
            logger.debug('AuthStore: Logout initiated');

            const { cart } = useCartStore.getState();
            const { token } = get();
            
            // Clear cart if exists
            if (token && cart.id !== 0) {
              try {
                await useCartStore.getState().clearCart();
              } catch (e) {
                logger.error('AuthStore: Error clearing cart on logout', e);
              }
            }

            // Clear state and cookies atomically
            set({ token: null, user: null, error: null });
            cookieUtils.remove(COOKIE_NAMES.AUTH_TOKEN);
            cookieUtils.remove(COOKIE_NAMES.USER_DATA);
            
            logger.debug('AuthStore: Logout completed');
          } finally {
            releaseLock();
          }
        },

        initializeAuth: async () => {
          if (get().isInitializing) {
            logger.warn('AuthStore: Already initializing, skipping');
            return;
          }

          if (!acquireLock()) {
            logger.warn('AuthStore: Initialize called while locked, skipping');
            return;
          }

          set({ isInitializing: true });

          try {
            const newState = initializeFromCookies();
            set({
              ...newState,
              isAuthReady: true,
              isInitializing: false,
            });
            logger.debug('AuthStore: Initialization completed', {
              hasToken: !!newState.token,
              hasUser: !!newState.user,
            });
          } catch (error) {
            logger.error('AuthStore: Error during initialization:', error);
            set({
              token: null,
              user: null,
              isAuthReady: true,
              isInitializing: false,
            });
          } finally {
            releaseLock();
          }
        },
      };
    },
    { name: 'AuthStore' }
  )
);

// Initialize on client side
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth();
}
