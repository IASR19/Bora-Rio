import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { eventsService } from '@/services/events.service';
import { geocodeAddress, lookupCep, type CepAddress } from '@/services/cep.service';
import { venuesService } from '@/services/venues.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Chip } from '@/shared/ui/Chip';
import { Input } from '@/shared/ui/Input';
import type { Venue } from '@/types/domain';
import { resizeImageToBase64 } from '@/utils/image';

const MUSIC = ['pagode', 'samba', 'sertanejo', 'eletronico', 'funk', 'pop', 'rock', 'mpb', 'jazz', 'outros'];
const CATEGORIES = ['bar', 'festa', 'restaurante', 'rooftop', 'praia', 'lounge'];
const COVER_SIZE = 800;
const VENUE_SEARCH_DEBOUNCE_MS = 300;

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

/** Datetime local pro <input type="datetime-local">, já a partir de amanhã. */
function defaultStartsAt() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function CreateEvent() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [venueQuery, setVenueQuery] = useState('');
  const [venueResults, setVenueResults] = useState<Venue[]>([]);
  const [searchingVenues, setSearchingVenues] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [creatingNewVenue, setCreatingNewVenue] = useState(false);
  const latestVenueQueryRef = useRef('');

  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueCategory, setNewVenueCategory] = useState('bar');
  const [isBusinessVenue, setIsBusinessVenue] = useState(false);
  const [cnpj, setCnpj] = useState('');
  const [cep, setCep] = useState('');
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [address, setAddress] = useState<CepAddress | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [musicGenres, setMusicGenres] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState(defaultStartsAt());
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    status: string;
    venueId: string;
    cnpjVerified: boolean;
    cnpjError: string | null;
  } | null>(null);

  const handleVenueQueryChange = (value: string) => {
    setVenueQuery(value);
    setSelectedVenue(null);
  };

  // Debounced e com guarda contra resposta fora de ordem: só aplica o resultado
  // se a busca ainda corresponder ao texto mais recente digitado.
  useEffect(() => {
    const query = venueQuery.trim();
    if (selectedVenue || query.length < 2) {
      setVenueResults([]);
      setSearchingVenues(false);
      return;
    }

    setSearchingVenues(true);
    const timeoutId = setTimeout(async () => {
      latestVenueQueryRef.current = query;
      try {
        const results = await venuesService.search({ q: query });
        if (latestVenueQueryRef.current === query) setVenueResults(results.slice(0, 6));
      } finally {
        if (latestVenueQueryRef.current === query) setSearchingVenues(false);
      }
    }, VENUE_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [venueQuery, selectedVenue]);

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
    setCepStatus('found');
    const geo = await geocodeAddress(found);
    setCoords(geo);
  };

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

    if (!selectedVenue && !creatingNewVenue) {
      setError('Escolha um local existente ou cadastre um novo.');
      return;
    }
    if (creatingNewVenue && (!newVenueName || !address || !coords)) {
      setError('Preencha nome, CEP e aguarde o endereço ser localizado.');
      return;
    }
    if (!name.trim() || musicGenres.length === 0) {
      setError('Dê um nome ao evento e escolha pelo menos um gênero musical.');
      return;
    }

    setLoading(true);
    try {
      const event = await eventsService.create({
        venueId: selectedVenue?.id,
        newVenue: creatingNewVenue
          ? {
              name: newVenueName,
              category: newVenueCategory,
              address: `${address!.street ? `${address!.street}, ` : ''}${address!.neighborhood}, ${address!.city} - ${address!.state}`,
              latitude: coords!.latitude,
              longitude: coords!.longitude,
              city: `${address!.city} - ${address!.state}`,
            }
          : undefined,
        name: name.trim(),
        description: description.trim() || undefined,
        musicGenres,
        startsAt: new Date(startsAt).toISOString(),
        coverImageUrl: coverImageUrl ?? undefined,
      });

      let cnpjVerified = false;
      let cnpjError: string | null = null;
      if (creatingNewVenue && isBusinessVenue && cnpj) {
        try {
          await venuesService.verifyWithCnpj(event.venueId, cnpj);
          cnpjVerified = true;
        } catch (cnpjErr) {
          cnpjError = cnpjErr instanceof ApiError ? cnpjErr.message : 'Não foi possível confirmar o CNPJ.';
        }
      }

      setResult({
        status: cnpjVerified ? 'published' : (event.status ?? 'published'),
        venueId: event.venueId,
        cnpjVerified,
        cnpjError,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar o evento.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const published = result.status === 'published';
    return (
      <div className="bg-background px-5 pt-8 text-center">
        <p className="text-2xl font-extrabold">{published ? 'Evento publicado! 🎉' : 'Evento enviado ✅'}</p>
        <p className="mx-auto mt-3 max-w-xs text-sm text-muted">
          {result.cnpjVerified
            ? 'CNPJ confirmado — o local ficou verificado e já aparece pra todo mundo.'
            : published
              ? 'Já aparece na busca pra todo mundo.'
              : 'Ainda está em análise — dá pra ver pelo link direto, e ele aparece pra todo mundo assim que ganhar mais confiança (ex.: pessoas confirmando presença de verdade no local, ou você verificar sua identidade em Perfil > Segurança).'}
        </p>
        {result.cnpjError && (
          <p className="mx-auto mt-3 max-w-xs text-sm text-destaque">
            O evento foi criado, mas não consegui confirmar o CNPJ: {result.cnpjError} O local continua sem
            verificação por enquanto.
          </p>
        )}
        <Button size="lg" className="mt-6 w-full" onClick={() => navigate(`/venue/${result.venueId}`)}>
          Ver evento
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background px-5 pt-6">
      <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="mt-4 text-2xl font-extrabold">Criar evento</h1>
      <p className="mt-1 text-sm text-muted">
        Local com CNPJ verificado, ou você com identidade verificada (Perfil {'>'} Segurança), publicam na hora.
        Senão, o evento fica em análise até 3 check-ins reais confirmarem que é de verdade.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">Local</label>
          {!creatingNewVenue ? (
            <>
              <Input
                placeholder="Buscar local existente..."
                value={selectedVenue ? selectedVenue.name : venueQuery}
                onChange={(e) => handleVenueQueryChange(e.target.value)}
              />
              {searchingVenues && <p className="mt-2 text-xs text-muted">Buscando...</p>}
              {!selectedVenue && venueResults.length > 0 && (
                <div className="mt-2 divide-y divide-border rounded-xl border border-border bg-surface">
                  {venueResults.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVenue(v);
                        setVenueQuery(v.name);
                        setVenueResults([]);
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm"
                    >
                      {v.name} <span className="text-muted">· {v.city}</span>
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setCreatingNewVenue(true);
                  setSelectedVenue(null);
                }}
                className="mt-2 text-sm font-semibold text-destaque"
              >
                Não encontrei o local
              </button>
            </>
          ) : (
            <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Cadastrar novo local</p>
                <button type="button" onClick={() => setCreatingNewVenue(false)} className="text-xs text-muted">
                  Cancelar
                </button>
              </div>
              <Input placeholder="Nome do local" value={newVenueName} onChange={(e) => setNewVenueName(e.target.value)} />
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <Chip key={c} selected={newVenueCategory === c} onClick={() => setNewVenueCategory(c)}>
                    {c}
                  </Chip>
                ))}
              </div>
              <Input placeholder="00000-000" value={cep} onChange={(e) => handleCepChange(e.target.value)} inputMode="numeric" />
              {cepStatus === 'loading' && <p className="text-xs text-muted">Buscando endereço...</p>}
              {cepStatus === 'not-found' && <p className="text-xs text-destaque">CEP não encontrado.</p>}
              {cepStatus === 'found' && address && (
                <p className="text-xs text-muted">
                  {address.street && `${address.street}, `}
                  {address.neighborhood} — {address.city}/{address.state}
                </p>
              )}

              <label className="flex items-center gap-2 pt-1 text-sm">
                <input
                  type="checkbox"
                  checked={isBusinessVenue}
                  onChange={(e) => setIsBusinessVenue(e.target.checked)}
                  className="h-4 w-4 accent-destaque"
                />
                É um estabelecimento comercial
              </label>
              {isBusinessVenue && (
                <>
                  <Input
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                    inputMode="numeric"
                  />
                  <p className="text-xs text-muted">CNPJ válido libera o local pra todo mundo na hora.</p>
                </>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">Nome do evento</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-destaque"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">Gêneros musicais</label>
          <div className="flex flex-wrap gap-2">
            {MUSIC.map((genre) => (
              <Chip key={genre} selected={musicGenres.includes(genre)} onClick={() => toggleMusicGenre(genre)}>
                {genre}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">Data e hora</label>
          <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-muted">Capa (opcional)</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-surface text-sm text-muted"
          >
            {coverImageUrl ? <img src={coverImageUrl} className="h-full w-full object-cover" alt="" /> : 'Escolher imagem'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        </div>

        {error && <p className="text-sm text-destaque">{error}</p>}

        <Button size="lg" className="w-full" type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar evento'}
        </Button>
      </form>
    </div>
  );
}
