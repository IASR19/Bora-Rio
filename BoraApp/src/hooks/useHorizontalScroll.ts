import { useEffect, useRef } from 'react';

/** Distância mínima (px) pra um arraste não contar como clique no item. */
const DRAG_THRESHOLD_PX = 5;

/**
 * Carrossel horizontal usável no desktop, onde o navegador só arrasta no toque:
 * - roda do mouse rola na horizontal (listener nativo { passive: false }, já que o onWheel
 *   do React é passivo e não deixa impedir a página de rolar junto);
 * - clicar e arrastar com o mouse rola o carrossel, sem disparar o clique do item solto no fim.
 */
export function useHorizontalScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let startX = 0;
    let startScrollLeft = 0;
    let pointerId: number | null = null;
    let dragged = false;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      // Nas pontas o carrossel não anda mais: devolve a roda pra página rolar normalmente,
      // senão o mouse parado em cima dos atalhos "trava" a rolagem da tela.
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      const atStart = e.deltaY < 0 && element.scrollLeft <= 0;
      const atEnd = e.deltaY > 0 && element.scrollLeft >= maxScrollLeft - 1;
      if (atStart || atEnd) return;
      e.preventDefault();
      element.scrollLeft += e.deltaY;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return; // toque já rola nativamente
      pointerId = e.pointerId;
      startX = e.clientX;
      startScrollLeft = element.scrollLeft;
      dragged = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      const delta = e.clientX - startX;
      if (!dragged && Math.abs(delta) < DRAG_THRESHOLD_PX) return;
      if (!dragged) {
        dragged = true;
        element.setPointerCapture(e.pointerId);
        // scroll-smooth animaria cada passo do arraste e deixaria o movimento atrasado.
        element.style.scrollBehavior = 'auto';
        element.style.cursor = 'grabbing';
      }
      element.scrollLeft = startScrollLeft - delta;
    };

    const endDrag = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      element.style.scrollBehavior = '';
      element.style.cursor = '';
    };

    // Depois de um arraste, o "click" que o navegador dispara ao soltar não seleciona o item.
    const handleClickCapture = (e: MouseEvent) => {
      if (!dragged) return;
      e.preventDefault();
      e.stopPropagation();
      dragged = false;
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', endDrag);
    element.addEventListener('pointercancel', endDrag);
    element.addEventListener('click', handleClickCapture, true);
    return () => {
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', endDrag);
      element.removeEventListener('pointercancel', endDrag);
      element.removeEventListener('click', handleClickCapture, true);
    };
  }, []);

  return ref;
}
