'use client';

import * as React from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/useMediaQuery';

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
};

export function RowActions({
  onEdit,
  onDelete,
  editLabel = 'Editar',
  deleteLabel = 'Eliminar',
}: Props) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100"
            aria-label="Acciones"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit ? (
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil className="h-4 w-4" />
              {editLabel}
            </DropdownMenuItem>
          ) : null}
          {onDelete ? (
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 className="h-4 w-4" />
              {deleteLabel}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {onEdit ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={editLabel}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={deleteLabel}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
