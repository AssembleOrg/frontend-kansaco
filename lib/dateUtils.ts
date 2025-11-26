// lib/dateUtils.ts
import { DateTime } from 'luxon';

// GMT-3 timezone (Buenos Aires)
const TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Get current date/time in GMT-3 timezone
 */
export const getCurrentDateTime = (): DateTime => {
  return DateTime.now().setZone(TIMEZONE);
};

/**
 * Format date to ISO string with GMT-3 timezone
 */
export const formatToISO = (date?: Date | string | DateTime): string => {
  if (!date) {
    return getCurrentDateTime().toISO() || '';
  }
  
  if (date instanceof DateTime) {
    return date.setZone(TIMEZONE).toISO() || '';
  }
  
  const dateTime = typeof date === 'string' 
    ? DateTime.fromISO(date).setZone(TIMEZONE)
    : DateTime.fromJSDate(date).setZone(TIMEZONE);
  
  return dateTime.toISO() || '';
};

/**
 * Format date for display in Spanish (Argentina locale) with GMT-3 timezone
 * Formats:
 * - 'short': "15 ene 2025"
 * - 'long': "15 de enero de 2025"
 * - 'datetime': "15 de enero de 2025, 14:30"
 * - 'datetime-full': "15 de enero de 2025, 14:30:00"
 */
export const formatDateForDisplay = (
  date?: Date | string | DateTime,
  format: 'short' | 'long' | 'datetime' | 'datetime-full' = 'short'
): string => {
  if (!date) {
    return '';
  }
  
  let dateTime: DateTime;
  
  if (date instanceof DateTime) {
    dateTime = date.setZone(TIMEZONE);
  } else if (typeof date === 'string') {
    // Si viene del backend, asumimos que está en ISO y lo convertimos a GMT-3
    dateTime = DateTime.fromISO(date, { zone: TIMEZONE });
  } else {
    dateTime = DateTime.fromJSDate(date, { zone: TIMEZONE });
  }
  
  // Si no es válida, retornar string vacío
  if (!dateTime.isValid) {
    return '';
  }
  
  const formats = {
    short: { month: 'short', day: 'numeric', year: 'numeric' } as const,
    long: { month: 'long', day: 'numeric', year: 'numeric' } as const,
    datetime: { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    } as const,
    'datetime-full': { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    } as const,
  };

  return dateTime.setLocale('es-AR').toLocaleString(formats[format]);
};

/**
 * Parse ISO string to DateTime in GMT-3
 */
export const parseISOToDateTime = (isoString: string): DateTime => {
  return DateTime.fromISO(isoString, { zone: TIMEZONE });
};

