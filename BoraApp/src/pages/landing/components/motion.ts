import { useEffect, useRef, useState, type RefObject } from 'react';

/** Curva de saída suave usada em toda a landing, pra o movimento da página
 * inteira parecer a mesma mão. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Atraso incremental entre itens de uma mesma lista (efeito cascata). */
export const STAGGER = 0.07;

/**
 * Diz se uma animação em loop deve estar rodando: só quando o elemento está
 * visível no viewport E a aba está em primeiro plano. Fora disso, congela —
 * não faz sentido gastar bateria animando pra ninguém.
 */
export function useAnimateWhileVisible<T extends Element>(ref: RefObject<T | null>) {
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(
    () => typeof document === 'undefined' || !document.hidden,
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    const onVisibilityChange = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  return inView && tabVisible;
}

/** Dispara uma vez, quando o elemento entra no viewport. */
export function useEnteredView<T extends Element>(ref: RefObject<T | null>, amount = 0.4) {
  const [entered, setEntered] = useState(false);
  const enteredRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || enteredRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        enteredRef.current = true;
        setEntered(true);
        observer.disconnect();
      },
      { threshold: amount },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, amount]);

  return entered;
}
