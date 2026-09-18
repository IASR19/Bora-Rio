import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-14 w-full rounded-xl border border-border bg-surface px-4 text-base text-foreground placeholder:text-muted outline-none transition-colors focus:border-destaque',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
