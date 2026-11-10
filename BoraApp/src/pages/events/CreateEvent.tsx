import { domainLabel } from '@/i18n/domain-label';
import { t, useI18n } from '@/i18n';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useBusinessMe } from '@/pages/business/BusinessLayout';
import { eventsService } from '@/services/events.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Chip } from '@/shared/ui/Chip';
import { Input } from '@/shared/ui/Input';
import { resizeImageToBase64 } from '@/utils/image';

const MUSIC = ['pagode', 'samba', 'sertanejo', 'eletronico', 'funk', 'pop', 'rock', 'mpb', 'jazz', 'outros'];
const COVER_SIZE = 800;

/** Datetime local pro <input type="datetime-local">, já a partir de amanhã. */
function defaultStartsAt() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

/** Criação de evento pelo comércio: o local é sempre o da própria conta. */
export function CreateEvent() {
  useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const me = useBusinessMe();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [musicGenres, setMusicGenres] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState(defaultStartsAt());
  const [endsAt, setEndsAt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCoverImageUrl(await resizeImageToBase64(file, COVER_SIZE));
    } catch {
      setError('Não foi possível processar essa imagem.');
    }
  };

  const toggleMusicGenre = (genre: string) => {
    setMusicGenres((current) => (current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || musicGenres.length === 0) {
      setError('Dê um nome ao evento e escolha pelo menos um gênero musical.');
      return;
    }
    if (endsAt && new Date(endsAt) <= new Date(startsAt)) {
      setError('O término precisa ser depois do início.');
      return;
    }
    setLoading(true);
    try {
      const event = await eventsService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        musicGenres,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        coverImageUrl: coverImageUrl ?? undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['business'] });
      navigate(`/business/events/${event.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.sourceMessage : 'Não foi possível criar o evento.');
    } finally {
      setLoading(false);
    }
  };

  const label = 'mb-2 block text-sm font-semibold text-muted';
  return (
    <div className="bg-background px-5 pt-6">
      <button
        onClick={() => navigate(-1)}
        aria-label={t('Voltar')}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="mt-4 text-2xl font-extrabold">{t('Criar evento')}</h1>
      <p className="mt-1 text-sm text-muted">
        {t('O evento é publicado na hora. Depois você pode adicionar promoções e mostrar o QR de check-in.')}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 pb-10">
        {me.data?.venue && (
          <div className="flex items-start gap-2 rounded-xl border border-border bg-surface p-3 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-destaque" />
            <p>
              <span className="block text-xs text-muted">{t('Local do evento')}</span>
              <span className="font-semibold">{me.data.venue.name}</span>
              <span className="block text-xs text-muted">{me.data.venue.address}</span>
            </p>
          </div>
        )}

        <div>
          <label className={label}>{t('Nome do evento')}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label className={label}>{t('Descrição')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-destaque"
          />
        </div>

        <div>
          <label className={label}>{t('Gêneros musicais')}</label>
          <div className="flex flex-wrap gap-2">
            {MUSIC.map((genre) => (
              <Chip
                key={genre}
                selected={musicGenres.includes(genre)}
                onClick={() => toggleMusicGenre(genre)}
              >
                {domainLabel(genre)}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>{t('Data e hora')}</label>
          <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
        </div>

        <div>
          <label className={label}>{t('Término (opcional)')}</label>
          <Input type="datetime-local" value={endsAt} min={startsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </div>

        <div>
          <label className={label}>{t('Capa (opcional)')}</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-surface text-sm text-muted"
          >
            {coverImageUrl ? (
              <img src={coverImageUrl} className="h-full w-full object-cover" alt="" />
            ) : (
              t('Escolher imagem')
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        </div>

        {error && <p className="text-sm text-destaque">{t(error)}</p>}

        <Button size="lg" className="w-full" type="submit" disabled={loading}>
          {loading ? t('Publicando...') : t('Publicar evento')}
        </Button>
      </form>
    </div>
  );
}
