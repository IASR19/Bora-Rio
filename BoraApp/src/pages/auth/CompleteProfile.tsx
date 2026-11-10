import { t, useI18n } from '@/i18n';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { geocodeAddress, lookupCep, type CepAddress } from '@/services/cep.service';
import { usersService } from '@/services/users.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { formatCep, formatCpf } from '@/utils/businessContract';
import { takePendingCheckin } from '@/utils/pendingCheckin';

export function CompleteProfile() {
  useI18n();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [cep, setCep] = useState('');
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [address, setAddress] = useState<CepAddress | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [city, setCity] = useState(user?.city ?? '');
  const [name, setName] = useState(user?.name ?? '');
  const [gender, setGender] = useState(user?.gender ?? 'undisclosed');
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? '');
  const [cpf, setCpf] = useState('');
  const needsCpf = !user?.cpf;
  // Só o CPF faltava (cadastro antigo): não precisa refazer o onboarding de preferências.
  const [onlyCpfMissing] = useState(() => !user?.cpf && !!user?.birthDate && !!user?.phone && !!user?.city);
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    setCep(formatted);

    const digits = formatted.replace(/\D/g, '');
    if (digits.length !== 8) {
      setCepStatus('idle');
      return;
    }

    setCepStatus('loading');
    const found = await lookupCep(digits);
    if (!found) {
      setCepStatus('not-found');
      return;
    }

    setAddress(found);
    setCity(`${found.city} - ${found.state}`);
    setCepStatus('found');

    // Best-effort — se não achar coordenada, o cadastro segue só com a cidade.
    const geo = await geocodeAddress(found);
    setCoords(geo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !birthDate || !phone || !city.trim()) {
      setError('Preencha idade, telefone e cidade pra continuar.');
      return;
    }

    if (needsCpf && cpf.replace(/\D/g, '').length !== 11) {
      setError('Informe o CPF completo.');
      return;
    }

    setLoading(true);
    try {
      await usersService.updateMe({
        ...(needsCpf ? { cpf: cpf.replace(/\D/g, '') } : {}),
        name: name.trim(),
        gender,
        birthDate,
        phone,
        city,
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
      });
      await refreshUser();
      const pending = takePendingCheckin();
      navigate(pending ?? (onlyCpfMissing ? '/home' : '/preferences/intentions'), { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.sourceMessage : 'Não foi possível salvar seu cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-dvh bg-background px-6 pb-10 pt-16">
      <h1 className="text-2xl font-extrabold">{t('Complete seu cadastro')}</h1>
      <p className="mt-2 text-sm text-muted">
        {' '}
        {t(
          'Precisamos da sua idade, telefone e localização pra calcular o BORA Score e mostrar o que está perto de você.',
        )}{' '}
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-muted" htmlFor="complete-name">
            {t('Nome')}
          </label>
          <Input
            id="complete-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={120}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-muted" htmlFor="complete-gender">
            {t('Gênero')}
          </label>
          <Select id="complete-gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="undisclosed">{t('Prefiro não dizer')}</option>
            <option value="female">{t('Feminino')}</option>
            <option value="male">{t('Masculino')}</option>
            <option value="other">{t('Outro')}</option>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">CEP</label>
          <Input
            placeholder="00000-000"
            value={cep}
            onChange={(e) => handleCepChange(e.target.value)}
            inputMode="numeric"
          />
          {cepStatus === 'loading' && <p className="mt-2 text-xs text-muted">{t('Buscando endereço...')}</p>}
          {cepStatus === 'not-found' && (
            <p className="mt-2 text-xs text-destaque">{t('CEP não encontrado — preencha a cidade manualmente.')}</p>
          )}
          {cepStatus === 'found' && address && (
            <p className="mt-2 text-xs text-muted">
              {address.street && `${address.street}, `}
              {address.neighborhood}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">{t('Cidade')}</label>
          <Input placeholder={t('Sua cidade')} value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">{t('Data de nascimento')}</label>
          <Input type="date" value={birthDate ?? ''} onChange={(e) => setBirthDate(e.target.value)} required />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">{t('Celular')}</label>
          <Input
            placeholder="+55 21 90000-0000"
            value={phone ?? ''}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {needsCpf && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-muted">CPF</label>
            <Input
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              inputMode="numeric"
              required
            />
          </div>
        )}

        {error && <p className="text-sm text-destaque">{t(error)}</p>}

        <Button size="lg" className="w-full" type="submit" disabled={loading}>
          {loading ? t('Salvando...') : t('Continuar')}
        </Button>
      </form>
    </div>
  );
}
