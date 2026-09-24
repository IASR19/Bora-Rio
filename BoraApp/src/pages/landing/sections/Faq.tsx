import { Plus } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

import { cn } from '@/utils/cn';

import { Reveal } from '../components/Reveal';
import { EASE_OUT, STAGGER } from '../components/motion';
import { FAQ } from '../data/landing.data';

/** Acordeão de dúvidas — um item aberto por vez. */
export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="landing-band py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-destaque">
            Perguntas frequentes
          </p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            O que todo mundo pergunta antes de criar a conta.
          </h2>
        </Reveal>

        <div className="mt-10 divide-y divide-border border-y border-border">
          {FAQ.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={item.question} delay={Math.min(index, 4) * STAGGER}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-base font-semibold sm:text-lg">{item.question}</span>
                    <Plus
                      className={cn(
                        'h-5 w-5 shrink-0 text-destaque transition-transform duration-300',
                        isOpen && 'rotate-45',
                      )}
                      strokeWidth={2.4}
                    />
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${index}`}
                      className="overflow-hidden"
                      initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                    >
                      <p className="pb-5 pr-8 text-sm leading-relaxed text-muted sm:text-base">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
