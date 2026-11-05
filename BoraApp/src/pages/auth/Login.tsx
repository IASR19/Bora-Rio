import { t, useI18n } from '@/i18n';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { featureFlags } from '@/config/featureFlags';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { isProfileComplete } from '@/utils/profile';

export function Login() {
  useI18n();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(isProfileComplete(user) ? '/home' : '/complete-profile', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.sourceMessage : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-dvh flex-col justify-center bg-background px-6 py-10">
      <h1 className="text-3xl font-extrabold">{t('Entrar no BORA')}</h1>

      <div className="mt-8 space-y-3">
        <GoogleSignInButton onSuccess={() => navigate('/home')} onError={setError} />
        {featureFlags.appleLogin && (
          <Button variant="outline" className="w-full" type="button">
            {' '}
            {t('Continuar com Apple')}{' '}
          </Button>
        )}
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" /> {t('ou')} <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder={t('E-mail')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={t('Senha')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-destaque">{t(error)}</p>}
        <Button size="lg" className="w-full" type="submit" disabled={loading}>
          {loading ? t('Entrando...') : t('Continuar')}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        {' '}
        {t('Ainda não tem conta?')}{' '}
        <Link to="/register" className="font-semibold text-foreground underline">
          {' '}
          {t('Criar conta')}{' '}
        </Link>
      </p>
    </div>
  );
}
