import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useI18n, type Language } from '@/i18n';
import { usersService } from '@/services/users.service';
import { cn } from '@/utils/cn';

const LANGUAGES: { value: Language; code: string; name: string }[] = [
  { value: 'pt', code: 'PT', name: 'Português' },
  { value: 'es', code: 'ES', name: 'Español' },
  { value: 'en', code: 'EN', name: 'English' },
];

const SYNC_ERROR = 'Idioma salvo neste dispositivo. Não foi possível sincronizar a conta.';

/** Troca o idioma na hora e, com alguém logado, salva a preferência na conta. */
function useChangeLanguage() {
  const { language, setLanguage, t } = useI18n();
  const { user, refreshUser } = useAuth();
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  const change = async (value: Language) => {
    if (value === language) return;
    setLanguage(value);
    setError(false);
    if (!user) return;
    setSaving(true);
    try {
      await usersService.updateMe({ language: value });
      await refreshUser();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  const dismissError = useCallback(() => setError(false), []);

  return { language, change, error, dismissError, saving, t };
}

const FLOATING_ERROR_MS = 5000;

/**
 * Botão compacto (globo + sigla) que abre a lista de idiomas.
 * Feito para morar dentro de um cabeçalho, ao lado das outras ações.
 */
export function LanguageMenu({ className }: { className?: string }) {
  const { language, change, error, dismissError, saving, t } = useChangeLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((item) => item.value === language) ?? LANGUAGES[0];

  // O aviso flutua sobre o cabeçalho: some sozinho (ou ao clicar) para não ficar cobrindo a página.
  useEffect(() => {
    if (!error) return;
    const id = setTimeout(dismissError, FLOATING_ERROR_MS);
    return () => clearTimeout(id);
  }, [error, dismissError]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('Idioma')}: ${current.name}`}
        disabled={saving}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-bold tracking-wide text-foreground transition-colors hover:border-destaque/60 disabled:opacity-60',
          open && 'border-destaque/60',
        )}
      >
        <Globe aria-hidden="true" className="h-4 w-4 text-destaque" />
        {current.code}
        <ChevronDown aria-hidden="true" className={cn('h-3.5 w-3.5 text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('Idioma')}
          className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-border bg-surface p-1.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)]"
        >
          {LANGUAGES.map((item) => {
            const active = item.value === language;
            return (
              <button
                key={item.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setOpen(false);
                  void change(item.value);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                  active ? 'bg-bora-gradient-soft font-semibold text-foreground' : 'text-muted hover:bg-surface-alt hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold',
                    active ? 'bg-bora-gradient text-white' : 'bg-surface-alt text-muted',
                  )}
                >
                  {item.code}
                </span>
                <span className="flex-1">{item.name}</span>
                {active && <Check aria-hidden="true" className="h-4 w-4 text-destaque" />}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <button
          type="button"
          role="alert"
          onClick={dismissError}
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-surface p-2.5 text-left text-xs text-destaque"
        >
          {t(SYNC_ERROR)}
        </button>
      )}
    </div>
  );
}

/**
 * Seletor de três opções lado a lado, para as telas de configuração
 * (Configurações do usuário e Conta do comércio).
 */
export function LanguageSelector({ className }: { className?: string }) {
  const { language, change, error, saving, t } = useChangeLanguage();

  return (
    <div className={className}>
      <div role="radiogroup" aria-label={t('Idioma')} className="grid grid-cols-3 gap-1 rounded-xl bg-surface-alt p-1">
        {LANGUAGES.map((item) => {
          const active = item.value === language;
          return (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={saving}
              onClick={() => void change(item.value)}
              className={cn(
                'rounded-lg px-2 py-2 text-sm font-semibold transition-colors disabled:opacity-60',
                active ? 'bg-bora-gradient text-white shadow-glow' : 'text-muted hover:text-foreground',
              )}
            >
              {item.name}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destaque">
          {t(SYNC_ERROR)}
        </p>
      )}
    </div>
  );
}

/** Rotas públicas do app (antes de entrar) que não têm cabeçalho próprio. */
const PUBLIC_APP_ROUTES = ['/welcome', '/how-it-works', '/permissions', '/login', '/register', '/verification', '/complete-profile'];

export function isPublicAppRoute(pathname: string) {
  return PUBLIC_APP_ROUTES.includes(pathname);
}

/**
 * Canto superior direito das telas de entrada (boas-vindas, login, cadastro).
 * Fica alinhado à coluna do app (480px), não à borda da janela, para não
 * flutuar longe do conteúdo no desktop.
 */
export function PublicLanguageCorner() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-40"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
    >
      <div className="mx-auto flex max-w-[480px] justify-end px-4">
        <LanguageMenu className="pointer-events-auto" />
      </div>
    </div>
  );
}
