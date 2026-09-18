import type { ReactNode } from 'react';

import { Button } from '@/shared/ui/Button';
import { cn } from '@/utils/cn';

export function PreferencesLayout({
  step,
  total,
  title,
  children,
  onContinue,
  continueDisabled,
}: {
  step: number;
  total: number;
  title: string;
  children: ReactNode;
  onContinue: () => void;
  continueDisabled?: boolean;
}) {
  return (
    <div className="app-shell flex min-h-dvh flex-col bg-background px-6 pb-8 pt-12">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, index) => (
          <span
            key={index}
            className={cn('h-1.5 flex-1 rounded-full bg-border', index < step && 'bg-bora-gradient')}
          />
        ))}
      </div>

      <h1 className="mt-6 text-2xl font-extrabold">{title}</h1>

      <div className="mt-6 flex-1 overflow-y-auto">{children}</div>

      <Button size="lg" className="mt-6 w-full" onClick={onContinue} disabled={continueDisabled}>
        Continuar
      </Button>
    </div>
  );
}
