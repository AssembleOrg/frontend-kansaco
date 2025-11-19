// lib/dateUtils.ts
import { DateTime } from 'luxon';

const TIMEZONE = 'America/Argentina/Buenos_Aires'; // GMT-3

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
 * Format date for display in Spanish (Argentina locale)
 */
export const formatDateForDisplay = (
  date?: Date | string | DateTime,
  format: 'short' | 'long' | 'datetime' = 'short'
): string => {
  if (!date) {
    return '';
  }
  
  let dateTime: DateTime;
  
  if (date instanceof DateTime) {
    dateTime = date.setZone(TIMEZONE);
  } else if (typeof date === 'string') {
    dateTime = DateTime.fromISO(date).setZone(TIMEZONE);
  } else {
    dateTime = DateTime.fromJSDate(date).setZone(TIMEZONE);
  }
  
  const formats = {
    short: { month: 'short', day: 'numeric', year: 'numeric' } as const,
    long: { month: 'long', day: 'numeric', year: 'numeric' } as const,
    datetime: { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' } as const,
  };

  return dateTime.setLocale('es-AR').toLocaleString(formats[format]);
};

/**
 * Parse ISO string to DateTime in GMT-3
 */
export const parseISOToDateTime = (isoString: string): DateTime => {
  return DateTime.fromISO(isoString).setZone(TIMEZONE);
};

