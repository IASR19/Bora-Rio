import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { useRef } from 'react';

import { Reveal } from '../components/Reveal';
import { STAGGER } from '../components/motion';
import { STEPS } from '../data/landing.data';

/**
 * Os quatro passos do produto numa trilha, não numa grade de cards iguais:
 * aqui existe uma sequência real (uma coisa leva à outra), e a linha que liga
 * os passos conta isso melhor do que caixas soltas.
 */
export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.8', 'end 0.6'],
  });
  const lineProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 24, restDelta: 0.001 });

  return (
    <section className="landing-band py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-destaque">
            Como funciona
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Do “não sei o que fazer hoje” até o rolê acontecer.
          </h2>
        </Reveal>

        <div ref={sectionRef} className="relative mt-14 pl-12 sm:pl-16">
          {/* A trilha: desenhada conforme a seção é rolada. */}
          <svg
            aria-hidden="true"
            className="absolute left-[18px] top-2 h-[calc(100%-2rem)] w-[3px] sm:left-[26px]"
            viewBox="0 0 3 100"
            preserveAspectRatio="none"
          >
            <line x1="1.5" y1="0" x2="1.5" y2="100" stroke="hsl(var(--border))" strokeWidth="3" />
            <motion.line
              x1="1.5"
              y1="0"
              x2="1.5"
              y2="100"
              stroke="url(#bora-trail)"
              strokeWidth="3"
              style={{ pathLength: prefersReducedMotion ? 1 : lineProgress }}
            />
            <defs>
              <linearGradient id="bora-trail" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF8A00" />
                <stop offset="55%" stopColor="#FF2D95" />
                <stop offset="100%" stopColor="#7A2BFF" />
              </linearGradient>
            </defs>
          </svg>

          <ol className="space-y-12">
            {STEPS.map((step, index) => (
              <Reveal as="li" key={step.number} delay={index * STAGGER} className="relative">
                <span className="absolute -left-12 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-[11px] font-extrabold text-destaque sm:-left-16 sm:h-[52px] sm:w-[52px] sm:text-sm">
                  {step.number}
                </span>
                <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">{step.title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                  {step.description}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
