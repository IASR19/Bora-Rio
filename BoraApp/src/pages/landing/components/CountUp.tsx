import { useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { useEnteredView } from './motion';

interface CountUpProps {
  to: number;
  durationMs?: number;
  className?: string;
}

/** Desaceleração (ease-out cúbico) — o número corre rápido e freia no final. */
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Número que conta de 0 até o valor final ao entrar na tela. Usado só no BORA
 * Score: um número grande contando o tempo todo vira ruído.
 */
export function CountUp({ to, durationMs = 900, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const entered = useEnteredView(ref);
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    /* Sem animação não há o que esperar: o valor final vai direto, sem
     * depender do elemento entrar no viewport. Caso contrário quem pediu
     * movimento reduzido leria "0" — que não é o número sem animação, é o
     * número errado. */
    if (prefersReducedMotion) {
      setValue(to);
      return;
    }
    if (!entered) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(Math.round(easeOut(progress) * to));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [entered, prefersReducedMotion, to, durationMs]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
