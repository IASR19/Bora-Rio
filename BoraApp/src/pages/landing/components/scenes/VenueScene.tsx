import { ArrowLeft, CalendarDays, Clock, Gift, Heart, MapPin } from 'lucide-react';

import { FaceStack, StatusBar } from './SceneChrome';

/** Cena 2 — a página do evento: o que é, quem vai e o benefício. */
export function VenueScene() {
  return (
    <div className="relative h-full bg-background">
      <div className="relative h-[168px]">
        <img
          src="/venues/marea-beach-club.webp"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-background/80 to-transparent pb-6">
          <StatusBar />
          <div className="mt-2 flex items-center justify-between px-4">
            <ArrowLeft className="h-[13px] w-[13px] text-foreground" strokeWidth={2.2} />
            <Heart className="h-[13px] w-[13px] text-foreground" strokeWidth={2.2} />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* relative z-10: o bloco sobe por cima da foto (-mt-3) e sem contexto de
       * empilhamento o título ficaria escondido atrás dela. */}
      <div className="relative z-10 -mt-3 px-4">
        <p className="text-[13px] font-extrabold leading-tight">Sunset do Marea</p>
        <div className="mt-1 flex items-center gap-1">
          <MapPin className="h-[9px] w-[9px] text-destaque" strokeWidth={2.4} />
          <span className="text-[8px] text-muted">Marea Beach Club • 2,1 km</span>
        </div>

        <div className="mt-2 flex gap-1.5">
          <span className="flex items-center gap-1 rounded-lg bg-surface px-2 py-1 text-[7.5px] text-muted">
            <CalendarDays className="h-[8px] w-[8px]" strokeWidth={2.2} />
            Sáb, 12 Out
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-surface px-2 py-1 text-[7.5px] text-muted">
            <Clock className="h-[8px] w-[8px]" strokeWidth={2.2} />
            18h – 02h
          </span>
        </div>

        <div className="mt-2 flex gap-1">
          <span className="rounded-md bg-surface px-1.5 py-0.5 text-[7px] text-muted">Pagode</span>
          <span className="rounded-md bg-surface px-1.5 py-0.5 text-[7px] text-muted">Open Bar</span>
          <span className="rounded-md bg-surface px-1.5 py-0.5 text-[7px] text-muted">120 confirmados</span>
        </div>

        <div className="mt-3">
          <FaceStack count={36} size={18} />
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-destaque/35 bg-bora-gradient-soft p-2.5">
          <Gift className="mt-[1px] h-[13px] w-[13px] shrink-0 text-destaque" strokeWidth={2.2} />
          <div>
            <p className="text-[8px] font-bold text-destaque">Benefício BORA</p>
            <p className="text-[9px] font-semibold">2 drinks até 21h</p>
          </div>
        </div>

        <div className="mt-3 flex h-9 items-center justify-center rounded-full bg-bora-gradient text-[10px] font-bold text-white shadow-glow">
          Quero ir
        </div>
        <p className="mt-2 text-center text-[7.5px] text-muted">Ver mais informações</p>
      </div>
    </div>
  );
}
