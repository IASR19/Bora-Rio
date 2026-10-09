import { forwardRef, type SelectHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        // color-scheme: sem ele a lista nativa aberta segue o tema do SO e pode ficar texto claro em fundo branco.
        '[color-scheme:dark] h-14 w-full rounded-xl border border-border bg-surface px-4 text-base text-foreground outline-none transition-colors focus:border-destaque disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
);
Select.displayName = 'Select';
