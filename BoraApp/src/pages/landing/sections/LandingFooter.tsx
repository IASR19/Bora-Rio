import { Link } from 'react-router-dom';

import eztechLogo from '@/assets/eztech-logo.png';

import { BrandLockup } from '../components/BrandLockup';
import { Reveal } from '../components/Reveal';
import { FOOTER } from '../data/landing.data';

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden pt-20 lg:pt-28">
      <div
        aria-hidden="true"
        className="absolute -bottom-40 left-1/2 -z-10 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-bora-gradient opacity-[0.16] blur-[110px]"
      />

      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <Reveal>
          <div className="text-center">
            <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {FOOTER.finalCtaTitle}
              <br />
              <span className="gradient-text">{FOOTER.finalCtaAccent}</span>
            </h2>
            <Link
              to="/welcome"
              className="cta-pulse mt-9 inline-flex h-14 items-center justify-center rounded-full bg-bora-gradient px-9 text-base font-bold text-white shadow-glow transition-transform active:scale-[0.98]"
            >
              Criar minha conta
            </Link>
            <p className="mt-4 text-xs text-muted">
              De graça, direto no navegador — sem passar por loja de aplicativo.
            </p>
          </div>
        </Reveal>

        <div className="mt-20 flex flex-col gap-6 border-t border-border py-8 sm:flex-row sm:items-center sm:justify-between">
          <BrandLockup withTagline />

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <Link to="/login" className="transition-colors hover:text-foreground">
              Entrar
            </Link>
            <Link to="/welcome" className="transition-colors hover:text-foreground">
              Criar conta
            </Link>
            <Link to="/profile/support" className="transition-colors hover:text-foreground">
              Suporte
            </Link>
          </nav>

          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted">
            {FOOTER.tagline}
          </p>
        </div>

        {/* Assinatura de quem desenvolve o BORA. Fica discreta e separada da
         * marca do produto: é crédito, não uma segunda marca disputando
         * atenção com o BORA. */}
        <div className="flex items-center gap-3 border-t border-border py-7">
          <img src={eztechLogo} alt="" aria-hidden="true" className="h-6 w-auto" />
          <p className="text-xs text-muted">
            Desenvolvido pela{' '}
            <span className="font-semibold text-foreground/90">EzTech Information</span> — soluções
            em tecnologia para um futuro mais eficiente.
          </p>
        </div>
      </div>
    </footer>
  );
}
