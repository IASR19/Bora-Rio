import { Sparkles, Users } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';

import { CheckInScene } from '../components/scenes/CheckInScene';
import { HomeScene } from '../components/scenes/HomeScene';
import { VenueScene } from '../components/scenes/VenueScene';
import { EASE_OUT, STAGGER } from '../components/motion';
import { PhoneMockup } from '../components/PhoneMockup';
import { Reveal } from '../components/Reveal';
import { HERO, HERO_STATS } from '../data/landing.data';

/**
 * Cartões que flutuam ao lado do celular. Ancorados por `right-full`, ou seja,
 * inteiramente FORA da moldura — encostados na borda esquerda dela, nunca por
 * cima do conteúdo da tela. Ficam os dois à esquerda de propósito: à direita
 * não há largura de viewport garantida a partir de `xl` sem cortar o cartão.
 */
const FLOATING = [
  { icon: Users, title: '+36 confirmaram', subtitle: 'Sunset do Marea', position: 'right-full top-20 mr-5' },
  { icon: Sparkles, title: 'BORA Score 92', subtitle: 'combina com você', position: 'right-full top-[62%] mr-12' },
];

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  /* Parallax curto e só no aparelho (elemento decorativo): começa em 0, então
   * nada nasce deslocado no carregamento. */
  const phoneY = useTransform(scrollY, [0, 700], [0, 48]);

  return (
    <section id="topo" className="relative overflow-hidden pb-4 pt-28 lg:pt-36">
      {/* Brilho da marca no topo — decorativo. */}
      <div
        aria-hidden="true"
        className="absolute -top-40 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-bora-gradient opacity-[0.14] blur-[110px]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8">
        <div>
          <Reveal>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.26em] text-muted">
              <span className="h-px w-6 bg-bora-gradient" />
              {HERO.eyebrow}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-5 text-[2.75rem] font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-[4.25rem]">
              {HERO.headlineStart}
              <br />
              <span className="gradient-text">{HERO.headlineAccent}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              {HERO.subtitle}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/welcome"
                className="cta-pulse inline-flex h-14 items-center justify-center rounded-full bg-bora-gradient px-8 text-base font-bold text-white shadow-glow transition-transform active:scale-[0.98]"
              >
                {HERO.primaryCta}
              </Link>
              <Link
                to="/login"
                className="inline-flex h-14 items-center justify-center rounded-full border border-border px-8 text-base font-semibold text-foreground transition-colors hover:bg-surface"
              >
                {HERO.secondaryCta}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
              {HERO_STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xl font-extrabold tracking-tight sm:text-2xl">{stat.value}</dt>
                  <dd className="mt-1 text-[11px] leading-snug text-muted">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <motion.div
            style={prefersReducedMotion ? undefined : { y: phoneY }}
            /* w-fit: sem isso o wrapper ocupa a coluna inteira do grid e os
             * cartões flutuantes se posicionam pela borda da coluna, caindo
             * por cima do aparelho em vez de ao lado dele. */
            className="relative w-fit"
          >
            <PhoneMockup
              scenes={[<HomeScene key="home" />, <VenueScene key="venue" />, <CheckInScene key="checkin" />]}
            />

            {FLOATING.map(({ icon: Icon, title, subtitle, position }, index) => (
              <motion.div
                key={title}
                /* cn() em vez de template literal: valores arbitrários com
                 * vírgula/parêntese interrompem o scanner do Tailwind e as
                 * classes seguintes na mesma string não são geradas. */
                className={cn(
                  'absolute hidden w-max items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 shadow-2xl shadow-black/70 backdrop-blur xl:flex',
                  position,
                )}
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * STAGGER * 3, ease: EASE_OUT }}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-bora-gradient-soft">
                  <Icon className="h-4 w-4 text-destaque" strokeWidth={2.2} />
                </span>
                <div>
                  <p className="text-xs font-bold">{title}</p>
                  <p className="text-[10px] text-muted">{subtitle}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
