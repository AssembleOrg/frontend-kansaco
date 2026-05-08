'use client';

import * as React from 'react';
import type { Category } from '@/types/category';
import { formatDateForDisplay } from '@/lib/dateUtils';
import { RowActions } from '@/features/crm/components/mobile/RowActions';

interface Props {
  category: Category;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}

export function CategoryCardMobile({ category, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center gap-3 border-b border-neutral-200/60 bg-white px-4 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium tracking-tight text-neutral-900">
          {category.name}
        </p>
        <p className="mt-0.5 text-[12px] tabular-nums text-neutral-500">
          Creada {formatDateForDisplay(category.createdAt, 'datetime')}
        </p>
      </div>
      <RowActions
        onEdit={() => onEdit(category)}
        onDelete={() => onDelete(category)}
      />
    </div>
  );
}
