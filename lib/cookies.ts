// lib/cookies.ts

export interface CookieOptions {
  expires?: number; // días
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export const cookieUtils = {
  // Establecer una cookie
  set: (name: string, value: string, options: CookieOptions = {}) => {
    if (typeof window === 'undefined') {
      console.warn('cookieUtils.set: Intentando establecer cookie en servidor');
      return;
    }

    if (!value) {
      console.warn(`cookieUtils.set: Valor vacío para cookie ${name}`);
      return;
    }

    const {
      expires, // No establecer valor por defecto aquí
      path = '/',
      secure = process.env.NODE_ENV === 'production',
      sameSite = 'lax'
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    // CAMBIO: Solo agregar expires si se especifica explícitamente
    // Sin expires = cookie de sesión (se borra al cerrar navegador/pestaña)
    if (expires !== undefined) {
      const date = new Date();
      date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }
    
    cookieString += `; path=${path}`;
    
    if (secure) {
      cookieString += '; secure';
    }
    
    cookieString += `; samesite=${sameSite}`;
    
    document.cookie = cookieString;
    console.log(`Cookie establecida: ${name} = ${value.substring(0, 20)}... (session: ${expires === undefined})`);
  },

  // Obtener una cookie
  get: (name: string): string | null => {
    if (typeof window === 'undefined') {
      console.warn('cookieUtils.get: Intentando leer cookie en servidor');
      return null;
    }

    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        const value = decodeURIComponent(cookie.substring(nameEQ.length));
        // Si el valor es literalmente "undefined", tratarlo como null
        if (value === 'undefined' || value === 'null') {
          console.log(`Cookie con valor inválido encontrada: ${name} = ${value}`);
          return null;
        }
        console.log(`Cookie leída: ${name} = ${value.substring(0, 20)}...`);
        return value;
      }
    }
    
    console.log(`Cookie no encontrada: ${name}`);
    return null;
  },

  // Eliminar una cookie
  remove: (name: string, options: Omit<CookieOptions, 'expires'> = {}) => {
    console.log(`Eliminando cookie: ${name}`);
    cookieUtils.set(name, '', { ...options, expires: -1 });
  },

  // Verificar si las cookies están disponibles
  isAvailable: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const testKey = 'cookie-test';
      cookieUtils.set(testKey, 'test');
      const result = cookieUtils.get(testKey) === 'test';
      cookieUtils.remove(testKey);
      return result;
    } catch {
      return false;
    }
  }
};

// Constantes para los nombres de las cookies
export const COOKIE_NAMES = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
} as const; 