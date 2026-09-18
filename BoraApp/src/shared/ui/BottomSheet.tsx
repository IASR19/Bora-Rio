import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl border-t border-border bg-surface p-5 pb-8">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
          {title && <Dialog.Title className="mb-4 text-lg font-bold">{title}</Dialog.Title>}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
