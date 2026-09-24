import { Calendar, Compass, Home, Plus, User } from 'lucide-react';

/**
 * Pedaços comuns às telas simuladas do mockup: barra de status e navegação
 * inferior, iguais às do app real (`components/BottomNavigation.tsx`).
 */

export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-2 text-[9px] font-semibold text-foreground">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="flex items-end gap-[1.5px]">
          <i className="h-[3px] w-[2px] rounded-sm bg-foreground" />
          <i className="h-[5px] w-[2px] rounded-sm bg-foreground" />
          <i className="h-[7px] w-[2px] rounded-sm bg-foreground" />
        </span>
        <span className="ml-[2px] h-[7px] w-[13px] rounded-[2px] border border-foreground/70">
          <i className="block h-full w-2/3 rounded-[1px] bg-foreground" />
        </span>
      </div>
    </div>
  );
}

const NAV = [
  { icon: Home, label: 'Início' },
  { icon: Compass, label: 'Explorar' },
  { icon: Plus, label: '' },
  { icon: Calendar, label: 'Eventos' },
  { icon: User, label: 'Perfil' },
];

export function BottomNav({ activeIndex = 0 }: { activeIndex?: number }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t border-border bg-surface/90 px-3 pb-3 pt-2 backdrop-blur">
      {NAV.map(({ icon: Icon, label }, index) =>
        label === '' ? (
          <span
            key="bora"
            className="-mt-6 flex h-11 w-11 items-center justify-center rounded-full bg-bora-gradient shadow-glow"
          >
            <Icon className="h-5 w-5 text-white" strokeWidth={2.6} />
          </span>
        ) : (
          <span key={label} className="flex flex-col items-center gap-[3px]">
            <Icon
              className={index === activeIndex ? 'h-[15px] w-[15px] text-destaque' : 'h-[15px] w-[15px] text-muted'}
              strokeWidth={index === activeIndex ? 2.4 : 1.8}
            />
            <span
              className={
                index === activeIndex
                  ? 'text-[7px] font-semibold text-destaque'
                  : 'text-[7px] text-muted'
              }
            >
              {label}
            </span>
          </span>
        ),
      )}
    </div>
  );
}

/** Pilha de rostinhos "+N confirmaram" — desenhada, sem foto de gente real. */
export function FaceStack({ count, size = 16 }: { count: number; size?: number }) {
  const tints = ['#FF8A00', '#FF2D95', '#7A2BFF', '#FF5C7A', '#B14BFF'];
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-1.5">
        {tints.map((tint) => (
          <span
            key={tint}
            style={{ height: size, width: size, backgroundColor: tint }}
            className="rounded-full border border-background opacity-90"
          />
        ))}
      </div>
      <span className="text-[8px] text-muted">+{count} confirmaram</span>
    </div>
  );
}
