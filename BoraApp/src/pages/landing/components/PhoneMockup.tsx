import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

import { EASE_OUT, useAnimateWhileVisible } from './motion';

interface PhoneMockupProps {
  /** As "telas" que se alternam dentro da moldura, em ordem de narrativa. */
  scenes: ReactNode[];
  className?: string;
  intervalMs?: number;
  /** Cena exibida, parada, sob `prefers-reduced-motion`. */
  staticSceneIndex?: number;
}

/**
 * Moldura de celular genérica e reutilizável (Hero e demais seções). As cenas
 * de dentro são responsabilidade de quem usa o componente.
 *
 * O ciclo só roda enquanto a moldura está visível e a aba está em primeiro
 * plano; sob `prefers-reduced-motion` fica parado numa cena só.
 */
export function PhoneMockup({
  scenes,
  className,
  intervalMs = 2800,
  staticSceneIndex = 1,
}: PhoneMockupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const running = useAnimateWhileVisible(containerRef);
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion || !running || scenes.length < 2) return;
    const id = setInterval(() => setIndex((current) => (current + 1) % scenes.length), intervalMs);
    return () => clearInterval(id);
  }, [running, prefersReducedMotion, scenes.length, intervalMs]);

  const visibleIndex = prefersReducedMotion
    ? Math.min(staticSceneIndex, scenes.length - 1)
    : index;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Brilho da marca por trás do aparelho — decorativo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 translate-y-6 scale-90 rounded-full bg-bora-gradient opacity-20 blur-3xl"
      />

      {/* A sombra arbitrária fica por último: valor com vírgula/parêntese
       * interrompe o scanner de classes do Tailwind, e o que vem depois dele
       * na mesma string não chega a ser gerado. */}
      <div className="relative w-[248px] rounded-[2.75rem] border-[9px] border-[#161d2c] bg-[#05070d] sm:w-[276px] shadow-[0_28px_70px_-20px_rgba(0,0,0,0.9)]">
        {/* Notch */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 z-20 h-[22px] w-[104px] -translate-x-1/2 rounded-b-2xl bg-[#161d2c]"
        />

        <div className="relative h-[520px] overflow-hidden rounded-[2.1rem] bg-background sm:h-[576px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={visibleIndex}
              className="h-full"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              {scenes[visibleIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Reflexo sutil no vidro. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[2.1rem] bg-gradient-to-br from-white/[0.07] via-transparent to-transparent"
        />
      </div>
    </div>
  );
}
