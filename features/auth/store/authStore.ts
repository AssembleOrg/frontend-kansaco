// features/auth/store/authStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User, LoginPayload, ActualLoginApiResponse } from '@/types/auth';
import { loginUser as apiLoginUser } from '@/lib/api';
import { useCartStore } from '@/features/cart/store/cartStore';
import { cookieUtils, COOKIE_NAMES } from '@/lib/cookies';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthReady: boolean;
  
  // Actions
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (payload: LoginPayload) => Promise<ActualLoginApiResponse>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
}

// Función para inicializar desde cookies
const initializeFromCookies = () => {
  if (typeof window === 'undefined') {
    console.log('AuthStore: Inicializando en servidor (SSR)');
    return { token: null, user: null, isAuthReady: false };
  }

  console.log('=== AuthStore: Inicializando desde cookies ===');
  console.log('Document cookies:', document.cookie);
  console.log('Is private browsing?:', !window.indexedDB); // Heurística para detectar navegación privada

  try {
    const token = cookieUtils.get(COOKIE_NAMES.AUTH_TOKEN);
    const userDataStr = cookieUtils.get(COOKIE_NAMES.USER_DATA);
    
    console.log('Token encontrado:', !!token, token ? `${token.substring(0, 20)}...` : 'null');
    console.log('User data encontrado:', !!userDataStr, userDataStr ? `${userDataStr.substring(0, 50)}...` : 'null');
    
    let user: User | null = null;
    if (userDataStr) {
      try {
        user = JSON.parse(userDataStr);
        console.log('User parseado exitosamente:', { id: user?.id, email: user?.email });
      } catch (e) {
        console.warn('AuthStore: Error parsing user data from cookie:', e);
        cookieUtils.remove(COOKIE_NAMES.USER_DATA);
      }
    }

    const result = { token, user, isAuthReady: true };
    console.log('Estado inicial calculado:', { hasToken: !!token, hasUser: !!user });
    console.log('=== Fin inicialización ===');
    
    return result;
  } catch (error) {
    console.error('AuthStore: Error inicializando desde cookies:', error);
    return { token: null, user: null, isAuthReady: true };
  }
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => {
      // Inicializar inmediatamente desde cookies
      const initialState = initializeFromCookies();
      
      return {
        ...initialState,
        isLoading: false,
        error: null,

        setToken: (token) => {
          set({ token });
          if (token) {
            cookieUtils.set(COOKIE_NAMES.AUTH_TOKEN, token);
          } else {
            cookieUtils.remove(COOKIE_NAMES.AUTH_TOKEN);
          }
        },

        setUser: (user) => {
          set({ user });
          if (user) {
            cookieUtils.set(COOKIE_NAMES.USER_DATA, JSON.stringify(user));
          } else {
            cookieUtils.remove(COOKIE_NAMES.USER_DATA);
          }
        },

        login: async (payload) => {
          set({ isLoading: true, error: null });
          try {
            const response = await apiLoginUser(payload);
            
            console.log('AuthStore: Respuesta completa del servidor:', response);
            
            // El servidor devuelve { status: "success", data: { token: "..." } }
            // Necesitamos extraer el token y crear un user básico
            const token = response.data?.token;
            
            if (!token) {
              console.error('AuthStore: No se encontró token en la respuesta');
              throw new Error('Token no encontrado en la respuesta del servidor');
            }
            
            // Decodificar el JWT para obtener información del usuario
            let user: User | null = null;
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              user = {
                id: payload.sub,
                email: payload.email,
                fullName: payload.fullName || payload.name || '' // Usar fullName del JWT si existe, sino vacío
              };
            } catch (e) {
              console.error('AuthStore: Error decodificando JWT:', e);
              throw new Error('Error procesando token de autenticación');
            }
            
            console.log('AuthStore: Login exitoso:', {
              hasToken: !!token,
              hasUser: !!user,
              userId: user?.id
            });
            
            // Establecer token y user directamente en el estado y cookies
            set({
              token,
              user,
              isLoading: false,
              error: null,
            });
            
            // Guardar en cookies
            cookieUtils.set(COOKIE_NAMES.AUTH_TOKEN, token);
            cookieUtils.set(COOKIE_NAMES.USER_DATA, JSON.stringify(user));
            
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

          const { cart } = useCartStore.getState();
          const { token } = get();
          
          if (token && cart.id !== 0) {
            try {
              console.log('AuthStore: (Idealmente) Carrito del servidor vaciado.');
            } catch (e) {
              console.error('AuthStore: Error vaciando carrito del servidor en logout', e);
            }
          }

          await useCartStore.getState().clearCart();

          // Limpiar estado y cookies
          set({ token: null, user: null, error: null });
          cookieUtils.remove(COOKIE_NAMES.AUTH_TOKEN);
          cookieUtils.remove(COOKIE_NAMES.USER_DATA);
          
          console.log('AuthStore: Estado de autenticación y cookies limpiados.');
        },

        initializeAuth: () => {
          const newState = initializeFromCookies();
          set(newState);
        },
      };
    }
  )
);

// Inicializar en el cliente
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth();
}
