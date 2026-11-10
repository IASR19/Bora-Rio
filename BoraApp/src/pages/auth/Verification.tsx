import { t, useI18n } from '@/i18n';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { useGoAfterLogin } from '@/hooks/useGoAfterLogin';
import { authService } from '@/services/auth.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';

const CODE_LENGTH = 6;
const emptyDigits = () => Array.from({ length: CODE_LENGTH }, () => '');

export function Verification() {
  useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const goAfterLogin = useGoAfterLogin();
  const { user, loading: authLoading, refreshUser, logout } = useAuth();
  const [digits, setDigits] = useState(emptyDigits);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const requestedRef = useRef(false);
  const leftRef = useRef(false);
  const next = (location.state as { next?: string } | null)?.next;
  const verified = !!user?.emailVerified;

  const requestCode = async () => {
    setError(null);
    try {
      const res = await authService.requestEmailVerification();
      setSeconds(res.retryInSeconds ?? 0);
      if (res.devCode) setDevCode(res.devCode);
    } catch (err) {
      setError(err instanceof ApiError ? err.sourceMessage : 'Não foi possível enviar o e-mail. Tente novamente em instantes.');
    }
  };

  // Pede o código uma única vez ao abrir (o ref sobrevive ao efeito duplo do StrictMode).
  useEffect(() => {
    if (!user || verified || requestedRef.current) return;
    requestedRef.current = true;
    void requestCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, verified]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  // Já verificado (ou acabou de confirmar): segue para o destino uma única vez.
  useEffect(() => {
    if (!user || !user.emailVerified || leftRef.current) return;
    leftRef.current = true;
    if (next) navigate(next, { replace: true });
    else goAfterLogin(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, next]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (verified) return null;

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 1) {
      fillFrom(index, cleaned);
      return;
    }
    const nextDigits = [...digits];
    nextDigits[index] = cleaned;
    setDigits(nextDigits);
    if (cleaned && index < CODE_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const fillFrom = (start: number, pasted: string) => {
    const nextDigits = [...digits];
    pasted
      .slice(0, CODE_LENGTH - start)
      .split('')
      .forEach((d, i) => {
        nextDigits[start + i] = d;
      });
    setDigits(nextDigits);
    inputsRef.current[Math.min(start + pasted.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) inputsRef.current[index - 1]?.focus();
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    e.preventDefault();
    fillFrom(pasted.length >= CODE_LENGTH ? 0 : index, pasted);
  };

  const handleResend = async () => {
    setDigits(emptyDigits());
    inputsRef.current[0]?.focus();
    await requestCode();
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await authService.confirmEmailVerification(digits.join(''));
      await refreshUser();
    } catch (err) {
      setError(err instanceof ApiError ? err.sourceMessage : 'Código inválido.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell flex min-h-dvh flex-col justify-center bg-background px-6 py-10">
      <h1 className="text-2xl font-extrabold">{t('Confirme seu e-mail')}</h1>
      <p className="mt-2 text-sm text-muted">
        {t('Enviamos um código para')} <span className="font-semibold">{user.email}</span>
      </p>

      <div className="mt-8 flex justify-between gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={(e) => handlePaste(index, e)}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`${t('Dígito')} ${index + 1}`}
            className="h-14 w-11 rounded-xl border border-border bg-surface text-center text-xl font-bold outline-none focus:border-destaque"
          />
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-destaque">{t(error)}</p>}
      {import.meta.env.DEV && devCode && (
        <p className="mt-3 text-xs text-muted">
          {t('Código de teste')}: {devCode}
        </p>
      )}

      <button
        type="button"
        className="mt-6 self-start text-sm font-semibold text-muted underline disabled:no-underline disabled:opacity-60"
        onClick={() => void handleResend()}
        disabled={seconds > 0}
      >
        {seconds > 0 ? t('Reenviar em {seconds}s', { seconds }) : t('Reenviar código')}
      </button>

      <Button
        size="lg"
        className="mt-10 w-full"
        onClick={() => void handleSubmit()}
        disabled={loading || digits.some((d) => !d)}
      >
        {loading ? t('Confirmando...') : t('Continuar')}
      </Button>

      <button
        type="button"
        className="mt-6 self-center text-sm font-semibold text-muted underline"
        onClick={() => void handleLogout()}
      >
        {t('Sair')}
      </button>
    </div>
  );
}
