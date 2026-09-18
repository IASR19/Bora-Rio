import { ArrowLeft } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
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
      await usersService.updateMe({ name, city, ...(avatarUrl ? { avatarUrl } : {}) });
      await refreshUser();
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
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>

        {error && <p className="text-sm text-destaque">{error}</p>}

        <Button size="lg" className="w-full" type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </div>
  );
}
