import { ArrowLeft } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { LocationFields } from '@/components/LocationFields';
import { useAuth } from '@/context/AuthContext';
import { useCityLocation } from '@/hooks/useCityLocation';
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
  const location = useCityLocation(user);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Cidade antiga fora do padrão IBGE (ex.: sem UF) não bloqueia trocar só nome/foto:
      // a localização só é validada se o usuário mexeu nela ou se já há uma seleção completa.
      const skipLocation = !location.touched && (!location.uf || !location.cityName);
      const resolved = skipLocation ? null : await location.resolve();
      if (!skipLocation && !resolved) return;
      await usersService.updateMe({
        name,
        ...(avatarUrl ? { avatarUrl } : {}),
        ...(resolved ? { city: resolved.city } : {}),
        ...(resolved?.latitude != null && resolved.longitude != null
          ? { latitude: resolved.latitude, longitude: resolved.longitude }
          : {}),
      });
      await refreshUser();
      if (resolved?.geocodeFailed) {
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

        <LocationFields location={location} />

        {(error ?? location.error) && <p className="text-sm text-destaque">{error ?? location.error}</p>}

        <Button size="lg" className="w-full" type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </div>
  );
}
