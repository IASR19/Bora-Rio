import { ArrowLeft, LocateFixed } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { geocodeCity, reverseGeocodeCity } from '@/services/geo.service';
import { usersService } from '@/services/users.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { resizeImageToBase64 } from '@/utils/image';

const AVATAR_SIZE = 256;

export function EditProfile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await resizeImageToBase64(file, AVATAR_SIZE);
      setAvatarUrl(base64);
    } catch {
      setError('Não foi possível processar essa imagem.');
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Seu navegador não permite acessar a localização.');
      return;
    }
    setError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: position }) => {
        const next = { latitude: position.latitude, longitude: position.longitude };
        setCoords(next);
        const detectedCity = await reverseGeocodeCity(next.latitude, next.longitude);
        if (detectedCity) setCity(detectedCity);
        setLocating(false);
      },
      () => {
        setError('Não foi possível obter sua localização. Verifique a permissão do navegador.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 15000 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // A coordenada é o que define a distância na busca: acompanha a cidade. GPS tem prioridade;
      // cidade digitada (nova, ou sem coordenada salva ainda) vira o centro da cidade.
      const needsGeocode = !coords && Boolean(city.trim()) && (city !== user?.city || user?.latitude == null);
      const location = coords ?? (needsGeocode ? await geocodeCity(city) : null);
      await usersService.updateMe({
        name,
        city,
        ...(avatarUrl ? { avatarUrl } : {}),
        ...(location ? { latitude: location.latitude, longitude: location.longitude } : {}),
      });
      await refreshUser();
      if (needsGeocode && !location) {
        // Salvo, mas a busca por distância seguiria usando o ponto antigo (ou nenhum): fica na tela e avisa.
        setError('Perfil salvo, mas não achamos essa cidade no mapa. Use "Usar minha localização atual".');
        return;
      }
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background px-5 pt-6">
      <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="mt-4 text-2xl font-extrabold">Editar perfil</h1>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-bora-gradient text-2xl font-extrabold text-white"
          >
            {avatarUrl ? (
              <img src={avatarUrl} className="h-full w-full object-cover" alt="" />
            ) : (
              (name || 'B').charAt(0)
            )}
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold text-destaque">
            Trocar foto
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">Nome</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">Cidade</label>
          <Input
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setCoords(null);
            }}
          />
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-destaque"
          >
            <LocateFixed className="h-4 w-4" />
            {locating ? 'Localizando...' : coords ? 'Localização atual definida' : 'Usar minha localização atual'}
          </button>
          <p className="mt-1 text-xs text-muted">Usada para mostrar o que está perto de você.</p>
        </div>

        {error && <p className="text-sm text-destaque">{error}</p>}

        <Button size="lg" className="w-full" type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </div>
  );
}
