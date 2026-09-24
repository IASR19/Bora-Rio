import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';

import { BrandLockup } from '../components/BrandLockup';

/** Cabeçalho fixo: só ganha fundo depois que a pessoa começa a rolar. */
export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled && 'border-b border-border bg-background/80 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 lg:px-8">
        <a href="#topo" aria-label="BORA — início da página">
          <BrandLockup />
        </a>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"
          >
            Entrar
          </Link>
          <Link
            to="/welcome"
            className="hidden rounded-full bg-bora-gradient px-5 py-2 text-sm font-bold text-white shadow-glow sm:block"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
