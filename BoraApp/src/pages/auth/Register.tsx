import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { featureFlags } from '@/config/featureFlags';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    gender: 'undisclosed',
    phone: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate(featureFlags.phoneVerification ? '/verification' : '/preferences/intentions', {
        state: { phone: form.phone },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar sua conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-dvh bg-background px-6 py-10">
      <h1 className="text-3xl font-extrabold">Criar conta</h1>
      <p className="mt-2 text-sm text-muted">Não pedimos informações desnecessárias.</p>

      <form className="mt-8 space-y-3" onSubmit={handleSubmit}>
        <Input placeholder="Nome" value={form.name} onChange={update('name')} required />
        <Input type="date" placeholder="Data de nascimento" value={form.birthDate} onChange={update('birthDate')} required />
        <select
          className="h-14 w-full rounded-xl border border-border bg-surface px-4 text-base text-foreground outline-none"
          value={form.gender}
          onChange={update('gender')}
        >
          <option value="undisclosed">Prefiro não dizer</option>
          <option value="female">Feminino</option>
          <option value="male">Masculino</option>
          <option value="other">Outro</option>
        </select>
        <Input placeholder="+55 21 90000-0000" value={form.phone} onChange={update('phone')} required />
        <Input type="email" placeholder="E-mail" value={form.email} onChange={update('email')} required />
        <Input type="password" placeholder="Senha" value={form.password} onChange={update('password')} required />
        {error && <p className="text-sm text-destaque">{error}</p>}
        <Button size="lg" className="w-full" type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Continuar'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Já tem uma conta?{' '}
        <Link to="/login" className="font-semibold text-foreground underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
