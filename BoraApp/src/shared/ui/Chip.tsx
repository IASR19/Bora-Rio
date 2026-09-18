import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
        selected
          ? 'border-transparent bg-bora-gradient text-white'
          : 'border-border bg-surface text-muted hover:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
