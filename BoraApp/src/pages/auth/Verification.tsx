import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { featureFlags } from '@/config/featureFlags';
import { authService } from '@/services/auth.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';

export function Verification() {
  const location = useLocation();
  const navigate = useNavigate();
  const phone = (location.state as { phone?: string } | null)?.phone ?? '';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Etapa desativada em teste (VITE_FEATURE_PHONE_VERIFICATION=false) — pula direto.
    if (!featureFlags.phoneVerification) {
      navigate('/preferences/intentions', { replace: true });
      return;
    }
    if (phone) authService.requestVerification(phone).catch(() => undefined);
  }, [phone, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await authService.confirmVerification(phone, digits.join(''));
      navigate('/preferences/intentions');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Código inválido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-dvh flex-col justify-center bg-background px-6 py-10">
      <h1 className="text-2xl font-extrabold">Confirme seu número</h1>
      <p className="mt-2 text-sm text-muted">Enviamos um código para {phone || 'o seu telefone'}</p>

      <div className="mt-8 flex justify-between gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            maxLength={1}
            inputMode="numeric"
            className="h-14 w-11 rounded-xl border border-border bg-surface text-center text-xl font-bold outline-none focus:border-destaque"
          />
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-destaque">{error}</p>}

      <button
        type="button"
        className="mt-6 text-sm font-semibold text-muted underline"
        onClick={() => authService.requestVerification(phone)}
      >
        Reenviar código
      </button>

      <Button size="lg" className="mt-10 w-full" onClick={handleSubmit} disabled={loading || digits.some((d) => !d)}>
        {loading ? 'Confirmando...' : 'Continuar'}
      </Button>
    </div>
  );
}
