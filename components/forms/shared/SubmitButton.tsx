'use client';

import { Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SubmitButtonProps {
  isSubmitting: boolean;
  label: string;
  submittingLabel?: string;
  icon?: LucideIcon;
}

export function SubmitButton({
  isSubmitting,
  label,
  submittingLabel = 'Enviando…',
  icon: Icon,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      aria-busy={isSubmitting}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#16a245] px-6 py-3 font-semibold text-white transition-all hover:bg-[#128a38] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-[#16a245]"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          {submittingLabel}
        </>
      ) : (
        <>
          {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
          {label}
        </>
      )}
    </button>
  );
}
