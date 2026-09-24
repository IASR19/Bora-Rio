import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { BoraScore } from './sections/BoraScore';
import { Club } from './sections/Club';
import { Discover } from './sections/Discover';
import { Faq } from './sections/Faq';
import { Hero } from './sections/Hero';
import { HowItWorks } from './sections/HowItWorks';
import { LandingFooter } from './sections/LandingFooter';
import { LandingHeader } from './sections/LandingHeader';
import { SkylineDivider } from './components/SkylineDivider';
import { isInstalledApp } from './isInstalledApp';

/**
 * Vitrine pública do BORA, na raiz do site.
 *
 * Fica fora do `.app-shell` (a coluna de 480px do app) de propósito: esta é a
 * única tela do projeto pensada para largura total de desktop.
 */
export function Landing() {
  const installed = isInstalledApp();

  /* A landing tem largura total e rolagem longa; o app é uma coluna de celular
   * com rolagem travada. Restaura o comportamento original ao sair daqui. */
  useEffect(() => {
    if (installed) return;
    const { body } = document;
    const previousOverscroll = body.style.overscrollBehaviorY;
    body.style.overscrollBehaviorY = 'auto';
    return () => {
      body.style.overscrollBehaviorY = previousOverscroll;
    };
  }, [installed]);

  /* Quem abriu pelo ícone do app instalado nunca vê a vitrine: vai direto pro
   * fluxo do app, exatamente como era antes da landing existir. */
  if (installed) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-dvh bg-background">
      <LandingHeader />

      <main>
        <Hero />
        <SkylineDivider className="landing-band-fill" />
        <HowItWorks />
        <Discover />
        <BoraScore />
        {/* A faixa do corte leva o fundo da seção de CIMA e o recorte é
         * preenchido com o da seção de BAIXO — sem isso o desenho fica da
         * mesma cor do próprio fundo e some. */}
        <SkylineDivider className="landing-band text-background" flip />
        <Club />
        <Faq />
      </main>

      <LandingFooter />
    </div>
  );
}
