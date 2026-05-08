import type { Deal, LeadType } from '@/types/crm';

export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '$ 0';
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return '$ 0';
  return num.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function formatRelativeTime(
  iso: string | null | undefined,
): string {
  if (!iso) return '';
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return '';
  const diffMs = Date.now() - target;
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 60) return 'hace instantes';
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `hace ${diffHr} h`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `hace ${diffDay} d`;
  const diffMonth = Math.round(diffDay / 30);
  if (diffMonth < 12) return `hace ${diffMonth} mes${diffMonth === 1 ? '' : 'es'}`;
  const diffYear = Math.round(diffMonth / 12);
  return `hace ${diffYear} año${diffYear === 1 ? '' : 's'}`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export function leadTypeLabel(tipo: LeadType): string {
  return tipo === 'MAYORISTA' ? 'Mayorista' : 'Revendedor';
}

export function leadTypeBadgeClass(tipo: LeadType): string {
  return tipo === 'MAYORISTA'
    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
    : 'bg-purple-50 text-purple-700 ring-1 ring-purple-200';
}

export function buildWhatsAppLink(telefono: string | null | undefined): string | null {
  if (!telefono) return null;
  const digits = telefono.replace(/[^\d]/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export function buildMailtoLink(email: string | null | undefined): string | null {
  if (!email) return null;
  return `mailto:${email}`;
}

export function dealTitle(deal: Pick<Deal, 'lead'>): string {
  return deal.lead?.nombre ?? 'Sin nombre';
}
