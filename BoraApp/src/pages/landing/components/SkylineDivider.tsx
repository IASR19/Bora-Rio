import { cn } from '@/utils/cn';

interface SkylineDividerProps {
  /**
   * Classes da faixa. O `text-*` define a cor do recorte, que deve ser a da
   * seção de BAIXO; se a seção de CIMA não for a cor de fundo padrão, passe
   * também o `bg-*` dela aqui — senão o desenho fica da mesma cor do próprio
   * fundo e desaparece.
   */
  className?: string;
  /** Espelha a silhueta, pra o corte de descida não repetir o de subida. */
  flip?: boolean;
}

/**
 * Corte entre duas seções em forma de horizonte do Rio (morros + prédios), em
 * vez da faixa reta de sempre. A silhueta é decorativa: `aria-hidden`, sem
 * conteúdo semântico.
 */
export function SkylineDivider({ className, flip = false }: SkylineDividerProps) {
  return (
    <div className={cn('pointer-events-none relative -mt-px w-full leading-[0]', className)} aria-hidden="true">
      <svg
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        className={cn('h-12 w-full fill-current md:h-20', flip && 'scale-x-[-1]')}
      >
        <path
          d="M0,96 V70 H72 V58 H106 V70 H168 L232,28 L274,60 L332,8 L392,60 L432,70 H512 V54 H548 V70 H636 V62 H676 V46 H712 V70 H804 L860,26 L916,70 H1012 V56 H1048 V70 H1140 V64 H1180 V50 H1216 V70 H1300 L1356,34 L1408,70 H1440 V96 Z"
        />
      </svg>
    </div>
  );
}
