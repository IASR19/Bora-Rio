import logo from '@/assets/logo.png';
import { cn } from '@/utils/cn';

interface BrandLockupProps {
  className?: string;
  /** Mostra a assinatura "Onde ir. Com quem ir." abaixo do nome. */
  withTagline?: boolean;
  size?: 'sm' | 'lg';
}

/**
 * O logo "por extenso" da identidade (ícone + nome + assinatura), montado em
 * CSS a partir do ícone que já existe no projeto — em vez de um PNG novo só
 * pro lockup, que sairia de sincronia no dia em que o ícone mudasse.
 */
export function BrandLockup({ className, withTagline = false, size = 'sm' }: BrandLockupProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src={logo}
        alt=""
        aria-hidden="true"
        className={size === 'lg' ? 'h-11 w-11' : 'h-8 w-8'}
      />
      <div>
        <p
          className={cn(
            'font-extrabold leading-none tracking-tight',
            size === 'lg' ? 'text-3xl' : 'text-xl',
          )}
        >
          BORA
        </p>
        {withTagline && (
          <p
            className={cn(
              'mt-1 uppercase tracking-[0.22em] text-muted',
              size === 'lg' ? 'text-[10px]' : 'text-[8px]',
            )}
          >
            Onde ir. Com quem ir.
          </p>
        )}
      </div>
    </div>
  );
}
