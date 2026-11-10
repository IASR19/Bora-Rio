import { getLocale, t, useI18n } from '@/i18n';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { businessService } from '@/services/business.service';

import { EventStatusBadge } from './EventStatusBadge';

export function BusinessEvents() {
  useI18n();
  const query = useQuery({ queryKey: ['business', 'events'], queryFn: businessService.events });
  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-extrabold">{t('Eventos')}</h1>
      {query.isLoading && <p className="py-8 text-muted">{t('Carregando...')}</p>}
      {query.isError && <p className="mt-4 text-sm text-destaque">{query.error.message}</p>}
      {query.data?.length === 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted">{t('Nenhum evento ainda.')}</p>
          <Link to="/business/events/new" className="mt-2 inline-block text-sm font-semibold text-destaque">
            {t('Criar evento')}
          </Link>
        </div>
      )}
      <div className="mt-5 space-y-3">
        {query.data?.map((e) => (
          <Link
            key={e.id}
            to={`/business/events/${e.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{e.name}</p>
              <p className="text-xs text-muted">{new Date(e.startsAt).toLocaleString(getLocale())}</p>
              <div className="mt-2">
                <EventStatusBadge status={e.status} />
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted" />
          </Link>
        ))}
      </div>
    </div>
  );
}
