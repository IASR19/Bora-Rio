import { Bell, MapPin, Search } from 'lucide-react';

import { BottomNav, FaceStack, StatusBar } from './SceneChrome';

const CHIPS = ['Hoje', 'Bares', 'Festas', 'Jantar'];

/** Cena 1 — "o que você quer fazer hoje?". Espelha a Home do app. */
export function HomeScene() {
  return (
    <div className="relative h-full bg-background">
      <StatusBar />

      <div className="flex items-center justify-between px-4 pt-3">
        <span className="text-[13px] font-extrabold tracking-tight">
          B<span className="gradient-text">ORA</span>
        </span>
        <div className="flex items-center gap-2">
          <Bell className="h-[13px] w-[13px] text-muted" strokeWidth={1.9} />
          <span className="h-[18px] w-[18px] rounded-full bg-bora-gradient opacity-80" />
        </div>
      </div>

      <div className="mt-1 flex items-center gap-1 px-4">
        <MapPin className="h-[9px] w-[9px] text-destaque" strokeWidth={2.4} />
        <span className="text-[8px] text-muted">Barra da Tijuca, RJ</span>
      </div>

      <div className="mx-4 mt-3 flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2">
        <Search className="h-[11px] w-[11px] text-muted" strokeWidth={2} />
        <span className="text-[9px] text-muted">O que você quer fazer hoje?</span>
      </div>

      <div className="mt-3 flex gap-1.5 overflow-hidden px-4">
        {CHIPS.map((chip, index) => (
          <span
            key={chip}
            className={
              index === 0
                ? 'rounded-lg bg-bora-gradient-soft px-2.5 py-1.5 text-[8px] font-semibold text-destaque ring-1 ring-destaque/40'
                : 'rounded-lg bg-surface px-2.5 py-1.5 text-[8px] text-muted'
            }
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between px-4">
        <span className="text-[10px] font-bold">Eventos para você</span>
        <span className="text-[8px] text-muted">Ver todos</span>
      </div>

      <div className="mx-4 mt-2 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="relative h-[104px]">
          <img
            src="/venues/marea-beach-club.webp"
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute right-2 top-2 flex flex-col items-center rounded-xl bg-background/85 px-2 py-1 backdrop-blur">
            <span className="text-[13px] font-extrabold leading-none">92</span>
            <span className="text-[6px] font-bold tracking-widest text-destaque">BORA</span>
          </div>
        </div>
        <div className="p-2.5">
          <p className="text-[10px] font-bold">Sunset do Marea</p>
          <p className="mt-0.5 text-[8px] text-muted">Marea Beach Club • 2,1 km</p>
          <div className="mt-1.5 flex gap-1">
            <span className="rounded-md bg-background px-1.5 py-0.5 text-[7px] text-muted">Pagode</span>
            <span className="rounded-md bg-background px-1.5 py-0.5 text-[7px] text-muted">Open Bar</span>
          </div>
          <div className="mt-2">
            <FaceStack count={36} />
          </div>
        </div>
      </div>

      {/* Segundo item da lista, em linha — mostra que a Home é uma lista, não
       * um card solto, e ocupa a tela até a navegação inferior. */}
      <div className="mx-4 mt-2.5 flex items-center gap-2.5 rounded-xl border border-border bg-surface p-2">
        <img
          src="/venues/casa-rosa-lapa.webp"
          alt=""
          loading="lazy"
          className="h-11 w-11 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[9px] font-bold">Festa X</p>
          <p className="mt-0.5 truncate text-[7.5px] text-muted">Casa Rosa Lapa • 8,4 km</p>
        </div>
        <span className="flex flex-col items-center rounded-lg bg-background px-1.5 py-1">
          <span className="text-[10px] font-extrabold leading-none">78</span>
          <span className="text-[5px] font-bold tracking-widest text-destaque">BORA</span>
        </span>
      </div>

      <BottomNav activeIndex={0} />
    </div>
  );
}
