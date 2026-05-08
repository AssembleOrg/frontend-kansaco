export type LeadType = 'MAYORISTA' | 'REVENDEDOR';
export type TerminalKind = 'WON' | 'LOST';
export type QuoteEstado =
  | 'BORRADOR'
  | 'ENVIADO'
  | 'ACEPTADO'
  | 'RECHAZADO';

export interface Lead {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  provincia: string | null;
  ciudad: string | null;
  tipo: LeadType;
  notasGenerales: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadCreateInput {
  nombre: string;
  email?: string;
  telefono?: string;
  provincia?: string;
  ciudad?: string;
  tipo?: LeadType;
  notasGenerales?: string;
}

export type LeadUpdateInput = Partial<LeadCreateInput>;

export interface Vendor {
  id: number;
  nombre: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorCreateInput {
  nombre: string;
  activo?: boolean;
}

export type VendorUpdateInput = Partial<VendorCreateInput>;

export interface TerminalReason {
  id: number;
  stageId: number;
  motivo: string;
  orden: number;
}

export interface PipelineStage {
  id: number;
  nombre: string;
  orden: number;
  color: string;
  probability: number;
  isTerminal: boolean;
  terminalKind: TerminalKind | null;
  reasons: TerminalReason[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStageCreateInput {
  nombre: string;
  orden: number;
  color?: string;
  probability?: number;
  isTerminal?: boolean;
  terminalKind?: TerminalKind | null;
}

export type PipelineStageUpdateInput = Partial<PipelineStageCreateInput>;

export interface DealStageInfo {
  id: number;
  nombre: string;
  orden: number;
  color: string;
  probability: number;
  isTerminal: boolean;
}

export interface DealReasonInfo {
  id: number;
  motivo: string;
}

export interface Deal {
  id: number;
  lead: Lead;
  vendor: Vendor | null;
  stage: DealStageInfo;
  currentReason: DealReasonInfo | null;
  monto: string | null;
  fechaCierre: string | null;
  ultimaActividad: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealNote {
  id: number;
  dealId: number;
  contenido: string;
  createdAt: string;
}

export interface DealStageHistoryEntry {
  id: number;
  fromStageId: number | null;
  fromStageNombre: string | null;
  toStageId: number;
  toStageNombre: string;
  reasonId: number | null;
  reasonMotivo: string | null;
  movedAt: string;
}

export interface DealDetail extends Deal {
  notes: DealNote[];
  history: DealStageHistoryEntry[];
}

export interface DealCreateInput {
  leadId: number;
  vendorId?: number;
  stageId?: number;
  monto?: string;
  fechaCierre?: string;
}

export interface DealUpdateInput {
  vendorId?: number | null;
  monto?: string | null;
  fechaCierre?: string | null;
}

export interface DealFilters {
  search?: string;
  vendorId?: number;
  stageId?: number;
  tipo?: LeadType;
  ciudad?: string;
  provincia?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  includeTerminal?: boolean;
}

export interface DealKanbanColumn {
  id: number;
  nombre: string;
  orden: number;
  color: string;
  probability: number;
  isTerminal: boolean;
  terminalKind: TerminalKind | null;
  deals: Deal[];
  cantidad: number;
  total: string;
  totalPonderado: string;
}

export interface DealKanban {
  columns: DealKanbanColumn[];
}

export interface QuoteItem {
  id: number;
  productId: number | null;
  productName: string;
  presentation: string | null;
  cantidad: string;
  precioUnitario: string;
  subtotal: string;
  orden: number;
}

export interface Quote {
  id: number;
  dealId: number;
  numero: string;
  titulo: string | null;
  subtotal: string;
  ivaPorcentaje: string;
  ivaMonto: string;
  total: string;
  estado: QuoteEstado;
  validoHasta: string | null;
  formaPago: string;
  notas: string | null;
  pdfUrl: string | null;
  items: QuoteItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItemInput {
  productId?: number;
  productName?: string;
  presentation?: string;
  cantidad: string;
  precioUnitario?: string;
  orden?: number;
}

export interface QuoteCreateInput {
  dealId: number;
  titulo?: string;
  ivaPorcentaje?: string;
  validoHasta?: string;
  formaPago?: string;
  notas?: string;
  items: QuoteItemInput[];
}

export interface QuoteUpdateInput {
  titulo?: string;
  ivaPorcentaje?: string;
  validoHasta?: string;
  formaPago?: string;
  notas?: string;
  items?: QuoteItemInput[];
}
