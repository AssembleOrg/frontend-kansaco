import type {
  Deal,
  DealCreateInput,
  DealDetail,
  DealFilters,
  DealKanban,
  DealNote,
  DealStageHistoryEntry,
  DealUpdateInput,
  Lead,
  LeadCreateInput,
  LeadUpdateInput,
  PipelineStage,
  PipelineStageCreateInput,
  PipelineStageUpdateInput,
  Quote,
  QuoteCreateInput,
  QuoteEstado,
  QuoteUpdateInput,
  TerminalReason,
  Vendor,
  VendorCreateInput,
  VendorUpdateInput,
} from '@/types/crm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface BackendValidationErrorItem {
  property: string;
  constraints?: { [key: string]: string };
}

interface BackendErrorResponse {
  statusCode?: number;
  message?: string | string[] | BackendValidationErrorItem[];
  error?: string;
}

function ensureBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }
  return API_BASE_URL;
}

function buildHeaders(token: string): HeadersInit {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function appendQuery(url: string, params: object): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    sp.append(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `${url}?${qs}` : url;
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'status' in payload &&
    'data' in payload
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as unknown as T;
    }
    try {
      const json = await response.json();
      return unwrapEnvelope<T>(json);
    } catch {
      return undefined as unknown as T;
    }
  }

  let message = `Error ${response.status}`;
  try {
    const raw = await response.json();
    const data = unwrapEnvelope<BackendErrorResponse>(raw);
    if (Array.isArray(data?.message)) {
      message = data.message
        .map((item) => {
          if (typeof item === 'string') return item;
          return item.constraints
            ? Object.values(item.constraints).join('. ')
            : JSON.stringify(item);
        })
        .join('; ');
    } else if (typeof data?.message === 'string') {
      message = data.message;
    } else if (data?.error) {
      message = data.error;
    }
  } catch {
    /* ignore */
  }
  throw new Error(message);
}

async function jsonFetch<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${ensureBaseUrl()}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: { ...buildHeaders(token), ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
  return handleResponse<T>(response);
}

// ----- Lead -----

export function getLeads(
  token: string,
  filters: {
    search?: string;
    tipo?: string;
    ciudad?: string;
    provincia?: string;
  } = {},
): Promise<Lead[]> {
  return jsonFetch<Lead[]>(
    token,
    appendQuery('/crm/lead', filters),
  );
}

export function getLeadById(token: string, id: number): Promise<Lead> {
  return jsonFetch<Lead>(token, `/crm/lead/${id}`);
}

export function createLead(
  token: string,
  payload: LeadCreateInput,
): Promise<Lead> {
  return jsonFetch<Lead>(token, '/crm/lead', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateLead(
  token: string,
  id: number,
  payload: LeadUpdateInput,
): Promise<Lead> {
  return jsonFetch<Lead>(token, `/crm/lead/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteLead(
  token: string,
  id: number,
): Promise<{ message: string }> {
  return jsonFetch<{ message: string }>(token, `/crm/lead/${id}`, {
    method: 'DELETE',
  });
}

// ----- Vendor -----

export function getVendors(
  token: string,
  includeInactive = false,
): Promise<Vendor[]> {
  return jsonFetch<Vendor[]>(
    token,
    appendQuery('/crm/vendor', { includeInactive }),
  );
}

export function createVendor(
  token: string,
  payload: VendorCreateInput,
): Promise<Vendor> {
  return jsonFetch<Vendor>(token, '/crm/vendor', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateVendor(
  token: string,
  id: number,
  payload: VendorUpdateInput,
): Promise<Vendor> {
  return jsonFetch<Vendor>(token, `/crm/vendor/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteVendor(
  token: string,
  id: number,
): Promise<{ message: string }> {
  return jsonFetch<{ message: string }>(token, `/crm/vendor/${id}`, {
    method: 'DELETE',
  });
}

// ----- Pipeline stage -----

export function getPipelineStages(token: string): Promise<PipelineStage[]> {
  return jsonFetch<PipelineStage[]>(token, '/crm/pipeline-stage');
}

export function createPipelineStage(
  token: string,
  payload: PipelineStageCreateInput,
): Promise<PipelineStage> {
  return jsonFetch<PipelineStage>(token, '/crm/pipeline-stage', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePipelineStage(
  token: string,
  id: number,
  payload: PipelineStageUpdateInput,
): Promise<PipelineStage> {
  return jsonFetch<PipelineStage>(token, `/crm/pipeline-stage/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deletePipelineStage(
  token: string,
  id: number,
): Promise<{ message: string }> {
  return jsonFetch<{ message: string }>(token, `/crm/pipeline-stage/${id}`, {
    method: 'DELETE',
  });
}

export function reorderPipelineStages(
  token: string,
  stageIds: number[],
): Promise<PipelineStage[]> {
  return jsonFetch<PipelineStage[]>(token, '/crm/pipeline-stage/reorder', {
    method: 'PATCH',
    body: JSON.stringify({ stageIds }),
  });
}

export function addTerminalReason(
  token: string,
  stageId: number,
  motivo: string,
  orden = 0,
): Promise<TerminalReason> {
  return jsonFetch<TerminalReason>(
    token,
    `/crm/pipeline-stage/${stageId}/reason`,
    {
      method: 'POST',
      body: JSON.stringify({ motivo, orden }),
    },
  );
}

export function updateTerminalReason(
  token: string,
  reasonId: number,
  payload: { motivo?: string; orden?: number },
): Promise<TerminalReason> {
  return jsonFetch<TerminalReason>(
    token,
    `/crm/pipeline-stage/reason/${reasonId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
}

export function deleteTerminalReason(
  token: string,
  reasonId: number,
): Promise<{ message: string }> {
  return jsonFetch<{ message: string }>(
    token,
    `/crm/pipeline-stage/reason/${reasonId}`,
    { method: 'DELETE' },
  );
}

// ----- Deal -----

export function getDealKanban(
  token: string,
  filters: DealFilters = {},
): Promise<DealKanban> {
  return jsonFetch<DealKanban>(token, appendQuery('/crm/deal/kanban', filters));
}

export function getDeals(
  token: string,
  filters: DealFilters = {},
): Promise<Deal[]> {
  return jsonFetch<Deal[]>(token, appendQuery('/crm/deal', filters));
}

export function getDealById(token: string, id: number): Promise<DealDetail> {
  return jsonFetch<DealDetail>(token, `/crm/deal/${id}`);
}

export function createDeal(
  token: string,
  payload: DealCreateInput,
): Promise<DealDetail> {
  return jsonFetch<DealDetail>(token, '/crm/deal', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateDeal(
  token: string,
  id: number,
  payload: DealUpdateInput,
): Promise<DealDetail> {
  return jsonFetch<DealDetail>(token, `/crm/deal/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteDeal(
  token: string,
  id: number,
): Promise<{ message: string }> {
  return jsonFetch<{ message: string }>(token, `/crm/deal/${id}`, {
    method: 'DELETE',
  });
}

export function moveDealToStage(
  token: string,
  id: number,
  toStageId: number,
  reasonId?: number,
): Promise<DealDetail> {
  return jsonFetch<DealDetail>(token, `/crm/deal/${id}/stage`, {
    method: 'PATCH',
    body: JSON.stringify({ toStageId, reasonId }),
  });
}

export function addDealNote(
  token: string,
  dealId: number,
  contenido: string,
): Promise<DealNote> {
  return jsonFetch<DealNote>(token, `/crm/deal/${dealId}/note`, {
    method: 'POST',
    body: JSON.stringify({ contenido }),
  });
}

export function getDealNotes(
  token: string,
  dealId: number,
): Promise<DealNote[]> {
  return jsonFetch<DealNote[]>(token, `/crm/deal/${dealId}/note`);
}

export function deleteDealNote(
  token: string,
  noteId: number,
): Promise<{ message: string }> {
  return jsonFetch<{ message: string }>(token, `/crm/deal/note/${noteId}`, {
    method: 'DELETE',
  });
}

export function getDealHistory(
  token: string,
  dealId: number,
): Promise<DealStageHistoryEntry[]> {
  return jsonFetch<DealStageHistoryEntry[]>(
    token,
    `/crm/deal/${dealId}/history`,
  );
}

// ----- Quote -----

export function getQuotesByDeal(
  token: string,
  dealId: number,
): Promise<Quote[]> {
  return jsonFetch<Quote[]>(token, appendQuery('/crm/quote', { dealId }));
}

export function getQuoteById(token: string, id: number): Promise<Quote> {
  return jsonFetch<Quote>(token, `/crm/quote/${id}`);
}

export function createQuote(
  token: string,
  payload: QuoteCreateInput,
): Promise<Quote> {
  return jsonFetch<Quote>(token, '/crm/quote', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateQuote(
  token: string,
  id: number,
  payload: QuoteUpdateInput,
): Promise<Quote> {
  return jsonFetch<Quote>(token, `/crm/quote/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function changeQuoteEstado(
  token: string,
  id: number,
  estado: QuoteEstado,
): Promise<Quote> {
  return jsonFetch<Quote>(token, `/crm/quote/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}

export function deleteQuote(
  token: string,
  id: number,
): Promise<{ message: string }> {
  return jsonFetch<{ message: string }>(token, `/crm/quote/${id}`, {
    method: 'DELETE',
  });
}

export async function downloadQuotePdf(
  token: string,
  id: number,
): Promise<Blob> {
  const response = await fetch(`${ensureBaseUrl()}/crm/quote/${id}/pdf`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Error ${response.status} descargando PDF`);
  }
  return response.blob();
}
