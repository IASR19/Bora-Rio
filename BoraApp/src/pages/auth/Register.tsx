import { t, useI18n } from '@/i18n';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { featureFlags } from '@/config/featureFlags';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';

export function Register() {
  useI18n();
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
      setError(err instanceof ApiError ? err.sourceMessage : 'Não foi possível criar sua conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-dvh bg-background px-6 py-10">
      <h1 className="text-3xl font-extrabold">{t('Criar conta')}</h1>
      <p className="mt-2 text-sm text-muted">{t('Não pedimos informações desnecessárias.')}</p>

      <form className="mt-8 space-y-3" onSubmit={handleSubmit}>
        <Input placeholder={t('Nome')} value={form.name} onChange={update('name')} required />
        <Input
          type="date"
          placeholder={t('Data de nascimento')}
          value={form.birthDate}
          onChange={update('birthDate')}
          required
        />
        <Select value={form.gender} onChange={update('gender')}>
          <option value="undisclosed">{t('Prefiro não dizer')}</option>
          <option value="female">{t('Feminino')}</option>
          <option value="male">{t('Masculino')}</option>
          <option value="other">{t('Outro')}</option>
        </Select>
        <Input placeholder="+55 21 90000-0000" value={form.phone} onChange={update('phone')} required />
        <Input type="email" placeholder={t('E-mail')} value={form.email} onChange={update('email')} required />
        <Input type="password" placeholder={t('Senha')} value={form.password} onChange={update('password')} required />
        {error && <p className="text-sm text-destaque">{t(error)}</p>}
        <Button size="lg" className="w-full" type="submit" disabled={loading}>
          {loading ? t('Criando...') : t('Continuar')}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        {' '}
        {t('Já tem uma conta?')}{' '}
        <Link to="/login" className="font-semibold text-foreground underline">
          {' '}
          {t('Entrar')}{' '}
        </Link>
      </p>
    </div>
  );
}
