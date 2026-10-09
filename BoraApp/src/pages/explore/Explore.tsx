import { useQuery } from '@tanstack/react-query';
import { ListFilter, Map as MapIcon, MapPin, Rows3, X } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { venuesService } from '@/services/venues.service';
import { isVenueCategory, venueCategoryLabel } from '@/shared/constants/venue-categories';
import { CoverImage } from '@/shared/ui/CoverImage';
import { ScoreBadge } from '@/shared/ui/ScoreBadge';
import { cn } from '@/utils/cn';

import { FiltersSheet, type Filters } from './FiltersSheet';

// Leaflet é pesado (~350kb) — só carrega quando a pessoa realmente troca pra "Mapa".
const VenueMap = lazy(() => import('@/components/VenueMap').then((m) => ({ default: m.VenueMap })));

export function Explore() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'list' | 'map'>('list');
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Atalhos de categoria da Home chegam como ?category=; valor desconhecido é ignorado (a API rejeitaria).
  const [filters, setFilters] = useState<Filters>(() => {
    const category = searchParams.get('category');
    return { q: searchParams.get('q') ?? undefined, category: isVenueCategory(category) ? category : undefined };
  });

  const lat = user?.latitude ?? undefined;
  const lng = user?.longitude ?? undefined;
  const { data: venues, isLoading } = useQuery({
    queryKey: ['venues', filters, lat, lng],
    queryFn: () => venuesService.search({ ...filters, lat, lng }),
  });

  return (
    <div className="bg-background px-5 pt-6">
      {filters.q && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5 text-sm">
          <span>
            Buscando por <strong>&ldquo;{filters.q}&rdquo;</strong>
          </span>
          <button onClick={() => setFilters((f) => ({ ...f, q: undefined }))} aria-label="Limpar busca">
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>
      )}
      {filters.category && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5 text-sm">
          <span>
            Categoria: <strong>{venueCategoryLabel(filters.category)}</strong>
          </span>
          <button onClick={() => setFilters((f) => ({ ...f, category: undefined }))} aria-label="Limpar categoria">
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex rounded-full border border-border bg-surface p-1">
          <button
            onClick={() => setMode('list')}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold',
              mode === 'list' ? 'bg-bora-gradient text-white' : 'text-muted',
            )}
          >
            <Rows3 className="h-4 w-4" /> Lista
          </button>
          <button
            onClick={() => setMode('map')}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold',
              mode === 'map' ? 'bg-bora-gradient text-white' : 'text-muted',
            )}
          >
            <MapIcon className="h-4 w-4" /> Mapa
          </button>
        </div>

        <button
          onClick={() => setFiltersOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
          aria-label="Filtros"
        >
          <ListFilter className="h-5 w-5" />
        </button>
      </div>

      {mode === 'map' ? (
        <div className="mt-6">
          {isLoading && <p className="mb-3 text-sm text-muted">Carregando...</p>}
          <Suspense
            fallback={
              <div className="flex h-[65vh] items-center justify-center rounded-2xl border border-border bg-surface text-sm text-muted">
                Carregando mapa...
              </div>
            }
          >
            <VenueMap venues={venues ?? []} />
          </Suspense>
        </div>
      ) : (
        <div className="mt-5 space-y-3 pb-6">
          {isLoading && <p className="text-sm text-muted">Carregando...</p>}
          {venues?.length === 0 && (
            <div className="rounded-2xl border border-border bg-surface p-6 text-center">
              {/* Só há corte por raio quando a localização é conhecida (ver isWithinRadius na API). */}
              {lat != null && filters.maxDistanceKm !== 0 ? (
                <>
                  <p className="font-semibold">Nada encontrado nesse raio.</p>
                  <p className="mt-1 text-sm text-muted">Aumente a distância para ver o que fica mais longe.</p>
                  <button
                    onClick={() => setFilters((f) => ({ ...f, maxDistanceKm: 0 }))}
                    className="mt-3 text-sm font-semibold text-destaque"
                  >
                    Ver qualquer distância
                  </button>
                </>
              ) : (
                <>
                  <p className="font-semibold">Nada encontrado.</p>
                  <p className="mt-1 text-sm text-muted">Tente limpar a busca ou os filtros.</p>
                </>
              )}
            </div>
          )}
          {user && lat == null && (
            <button
              onClick={() => navigate('/profile/edit')}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-left text-sm text-muted"
            >
              Sem sua localização, a lista não é ordenada pela distância. <strong>Definir localização</strong>
            </button>
          )}
          {venues?.map((venue) => (
            <button
              key={venue.id}
              onClick={() => navigate(`/venue/${venue.id}`)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-bora-gradient-soft">
                <CoverImage src={venue.coverImageUrl} alt="" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{venue.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <MapPin className="h-3 w-3" />
                  {venue.distanceKm != null ? `${venue.distanceKm.toFixed(1)} km` : venue.city}
                </p>
                <p className="mt-1 text-xs text-muted">{venueCategoryLabel(venue.category)} · {venue.priceRange}</p>
              </div>
              {venue.boraScore != null && <ScoreBadge score={venue.boraScore} className="h-11 w-11" />}
            </button>
          ))}
        </div>
      )}

      <FiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        value={filters}
        onApply={setFilters}
        hasPreferences={Boolean(user)}
      />
    </div>
  );
}
