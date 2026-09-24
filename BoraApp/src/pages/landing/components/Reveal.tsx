import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

import { EASE_OUT } from './motion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Atraso em segundos — use com `STAGGER` pra cascatear itens de uma lista. */
  delay?: number;
  /** Distância da subida de entrada. */
  y?: number;
  as?: 'div' | 'li' | 'section';
}

/**
 * Entrada padrão de qualquer bloco da landing: aparece subindo, uma vez só,
 * quando 20% dele está visível. Sob `prefers-reduced-motion`, renderiza o
 * conteúdo já na posição final, sem nenhuma transição.
 */
export function Reveal({ children, className, delay = 0, y = 18, as = 'div' }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const Tag = motion[as];

  if (prefersReducedMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
    >
      {children}
    </Tag>
  );
}
