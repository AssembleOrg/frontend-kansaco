'use client';

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from '@/components/ui/responsive-dialog';
import MayoristaApplicationForm from './MayoristaApplicationForm';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function MayoristaApplicationModal({ open, onOpenChange }: Props) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent
        className="max-h-[90dvh] overflow-y-auto max-w-2xl border-gray-800 bg-gray-950 text-white sm:rounded-2xl
          !duration-[420ms]
          !ease-[cubic-bezier(0.32,0.72,0,1)]
          data-[state=open]:!slide-in-from-top-0 data-[state=open]:!slide-in-from-left-0
          data-[state=closed]:!slide-out-to-top-0 data-[state=closed]:!slide-out-to-left-0"
      >
        <ResponsiveDialogHeader className="text-left">
          <ResponsiveDialogTitle className="text-2xl font-bold text-white">
            Solicitá tu cuenta de Mayorista
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-gray-400">
            Completá el formulario y te contactamos en menos de 48hs hábiles.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="mt-4">
          <MayoristaApplicationForm onSubmitSuccess={() => onOpenChange(false)} />
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
