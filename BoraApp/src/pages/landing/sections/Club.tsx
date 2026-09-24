import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Reveal } from '../components/Reveal';
import { CLUB } from '../data/landing.data';

const [priceInteger, priceCents] = CLUB.price.toFixed(2).split('.');

/** Espelha a tela de assinatura do app: um preço só, os mesmos benefícios. */
export function Club() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-destaque">
            Assinatura
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            O app é de graça. O <span className="gradient-text">{CLUB.name}</span> é pra quem sai
            de verdade.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 overflow-hidden rounded-3xl border border-destaque/40 bg-surface">
            <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
                  {CLUB.name}
                </p>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-muted">R$</span>
                  <span className="text-6xl font-extrabold tracking-tight sm:text-7xl">
                    {priceInteger}
                  </span>
                  <span className="text-2xl font-extrabold tracking-tight">,{priceCents}</span>
                  <span className="text-base font-medium text-muted">{CLUB.period}</span>
                </p>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{CLUB.note}</p>

                <Link
                  to="/welcome"
                  className="mt-7 inline-flex h-14 items-center justify-center rounded-full bg-bora-gradient px-7 text-base font-bold text-white shadow-glow transition-transform active:scale-[0.98]"
                >
                  Começar de graça
                </Link>
              </div>

              <ul className="grid gap-3 border-t border-border pt-7 sm:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                {CLUB.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2.5 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bora-gradient">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
