import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { geocodeAddress, lookupCep, type CepAddress } from '@/services/cep.service';
import { usersService } from '@/services/users.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function CompleteProfile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [cep, setCep] = useState('');
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [address, setAddress] = useState<CepAddress | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [city, setCity] = useState(user?.city ?? '');
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? '');
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

    if (!birthDate || !phone || !city) {
      setError('Preencha idade, telefone e cidade pra continuar.');
      return;
    }

    setLoading(true);
    try {
      await usersService.updateMe({
        birthDate,
        phone,
        city,
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
      });
      await refreshUser();
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar seu cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-dvh bg-background px-6 py-10">
      <h1 className="text-2xl font-extrabold">Complete seu cadastro</h1>
      <p className="mt-2 text-sm text-muted">
        Precisamos da sua idade, telefone e localização pra calcular o BORA Score e mostrar o que está
        perto de você.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">CEP</label>
          <Input
            placeholder="00000-000"
            value={cep}
            onChange={(e) => handleCepChange(e.target.value)}
            inputMode="numeric"
          />
          {cepStatus === 'loading' && <p className="mt-2 text-xs text-muted">Buscando endereço...</p>}
          {cepStatus === 'not-found' && (
            <p className="mt-2 text-xs text-destaque">CEP não encontrado — preencha a cidade manualmente.</p>
          )}
          {cepStatus === 'found' && address && (
            <p className="mt-2 text-xs text-muted">
              {address.street && `${address.street}, `}
              {address.neighborhood}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">Cidade</label>
          <Input placeholder="Sua cidade" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">Data de nascimento</label>
          <Input type="date" value={birthDate ?? ''} onChange={(e) => setBirthDate(e.target.value)} required />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">Celular</label>
          <Input
            placeholder="+55 21 90000-0000"
            value={phone ?? ''}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-destaque">{error}</p>}

        <Button size="lg" className="w-full" type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Continuar'}
        </Button>
      </form>
    </div>
  );
}
