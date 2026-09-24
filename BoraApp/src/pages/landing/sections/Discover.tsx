import { MapPin } from 'lucide-react';

import { Reveal } from '../components/Reveal';
import { STAGGER } from '../components/motion';
import { VENUES } from '../data/landing.data';

/** Os lugares reais que já estão no app — as mesmas imagens, os mesmos nomes. */
export function Discover() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-destaque">
            O que tem pra fazer
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Da roda de samba no Vidigal ao rooftop na Barra.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            A primeira leva do BORA cobre bar, festa, rooftop, restaurante e praia — de econômico
            a premium, do Recreio à Lapa.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VENUES.map((venue, index) => (
            <Reveal
              as="li"
              key={venue.name}
              delay={(index % 3) * STAGGER}
              className="group overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={venue.image}
                  alt={`${venue.name}, ${venue.neighborhood}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface to-transparent" />
              </div>

              <div className="p-4">
                <p className="text-base font-bold tracking-tight">{venue.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <MapPin className="h-3 w-3 text-destaque" strokeWidth={2.4} />
                  {venue.neighborhood}
                </p>
                <p className="mt-3 text-sm text-foreground/90">{venue.event}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {venue.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-background px-2 py-1 text-[11px] text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
