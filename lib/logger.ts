// lib/logger.ts
export const logger = {
  log: (..._args: unknown[]) => {},
  error: (..._args: unknown[]) => {},
  warn: (..._args: unknown[]) => {},
  info: (..._args: unknown[]) => {},
  debug: (..._args: unknown[]) => {}
};

// Helper para logging de API calls
export const apiLogger = {
  request: (
    _method: string,
    _url: string,
    _data?: unknown
  ) => {},
  response: (
    _method: string,
    _url: string,
    _status: number,
    _data?: unknown
  ) => {},
  error: (_method: string, _url: string, _error: unknown) => {}
}; 