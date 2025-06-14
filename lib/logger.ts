// lib/logger.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

// Helper para logging de API calls
export const apiLogger = {
  request: (method: string, url: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`🔄 API ${method} ${url}`, data ? { data } : '');
    }
  },
  response: (method: string, url: string, status: number, data?: unknown) => {
    if (isDevelopment) {
      const emoji = status >= 200 && status < 300 ? '✅' : '❌';
      console.log(`${emoji} API ${method} ${url} - ${status}`, data ? { data } : '');
    }
  },
  error: (method: string, url: string, error: unknown) => {
    if (isDevelopment) {
      console.error(`❌ API ${method} ${url} - ERROR:`, error);
    }
  }
}; 