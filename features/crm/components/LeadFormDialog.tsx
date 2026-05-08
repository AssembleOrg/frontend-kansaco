'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { createLead, updateLead } from '@/lib/crmApi';
import type { Lead, LeadCreateInput, LeadType } from '@/types/crm';

interface LeadFormDialogProps {
  open: boolean;
  initial?: Lead | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (lead: Lead) => void;
}

const EMPTY: LeadCreateInput = {
  nombre: '',
  email: '',
  telefono: '',
  provincia: '',
  ciudad: '',
  tipo: 'MAYORISTA',
  notasGenerales: '',
};

export function LeadFormDialog({
  open,
  initial,
  onOpenChange,
  onSaved,
}: LeadFormDialogProps) {
  const { token } = useAuth();
  const [form, setForm] = useState<LeadCreateInput>(EMPTY);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        nombre: initial?.nombre ?? '',
        email: initial?.email ?? '',
        telefono: initial?.telefono ?? '',
        provincia: initial?.provincia ?? '',
        ciudad: initial?.ciudad ?? '',
        tipo: initial?.tipo ?? 'MAYORISTA',
        notasGenerales: initial?.notasGenerales ?? '',
      });
    }
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!form.nombre.trim()) {
      toast.error('Nombre es obligatorio');
      return;
    }
    try {
      setIsSaving(true);
      const cleaned: LeadCreateInput = {
        nombre: form.nombre.trim(),
        email: form.email?.trim() || undefined,
        telefono: form.telefono?.trim() || undefined,
        provincia: form.provincia?.trim() || undefined,
        ciudad: form.ciudad?.trim() || undefined,
        tipo: form.tipo,
        notasGenerales: form.notasGenerales?.trim() || undefined,
      };
      const saved = initial
        ? await updateLead(token, initial.id, cleaned)
        : await createLead(token, cleaned);
      toast.success(initial ? 'Lead actualizado' : 'Lead creado');
      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error guardando lead');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar lead' : 'Nuevo lead'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email ?? ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={form.telefono ?? ''}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="provincia">Provincia</Label>
              <Input
                id="provincia"
                value={form.provincia ?? ''}
                onChange={(e) =>
                  setForm({ ...form, provincia: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                value={form.ciudad ?? ''}
                onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <select
              id="tipo"
              value={form.tipo}
              onChange={(e) =>
                setForm({ ...form, tipo: e.target.value as LeadType })
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="MAYORISTA">Mayorista</option>
              <option value="REVENDEDOR">Revendedor</option>
            </select>
          </div>
          <div>
            <Label htmlFor="notas">Notas generales</Label>
            <Textarea
              id="notas"
              rows={3}
              value={form.notasGenerales ?? ''}
              onChange={(e) =>
                setForm({ ...form, notasGenerales: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando…' : initial ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
