import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { featureFlags } from '@/config/featureFlags';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

export function Login() {
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
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-dvh flex-col justify-center bg-background px-6 py-10">
      <h1 className="text-3xl font-extrabold">Entrar no BORA</h1>

      <div className="mt-8 space-y-3">
        <GoogleSignInButton onSuccess={() => navigate('/home')} onError={setError} />
        {featureFlags.appleLogin && (
          <Button variant="outline" className="w-full" type="button">
            Continuar com Apple
          </Button>
        )}
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-destaque">{error}</p>}
        <Button size="lg" className="w-full" type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Continuar'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Ainda não tem conta?{' '}
        <Link to="/register" className="font-semibold text-foreground underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
