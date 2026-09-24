import { Check } from 'lucide-react';

import { CountUp } from '../components/CountUp';
import { Reveal } from '../components/Reveal';
import { STAGGER } from '../components/motion';
import { SCORE_CRITERIA } from '../data/landing.data';

/** O número que aparece em cima de cada evento no app, explicado. */
export function BoraScore() {
  return (
    <section className="landing-band py-20 lg:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <div className="relative mx-auto flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-bora-gradient opacity-20 blur-2xl"
            />
            <div className="relative flex h-full w-full flex-col items-center justify-center rounded-full border border-destaque/30 bg-background">
              <CountUp to={92} className="gradient-text text-7xl font-extrabold tracking-tight sm:text-8xl" />
              <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
                Bora Score
              </span>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-destaque">
              Por que esse rolê e não outro
            </p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Um número que diz o quanto aquilo combina com você.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Todo evento no BORA carrega um score calculado pra você — não é média de estrelinha
              de desconhecido. Ele leva em conta:
            </p>
          </Reveal>

          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {SCORE_CRITERIA.map((criterion, index) => (
              <Reveal
                as="li"
                key={criterion}
                delay={(index % 2) * STAGGER}
                className="flex items-center gap-2.5 text-sm text-foreground/90"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bora-gradient">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
                {criterion}
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
