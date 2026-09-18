import { useQuery } from '@tanstack/react-query';
import { Bell, Beer, MapPin, Music, PartyPopper, Search, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { EventCard } from '@/components/EventCard';
import { useAuth } from '@/context/AuthContext';
import { eventsService } from '@/services/events.service';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/utils/cn';

const SHORTCUTS = [
  { key: 'agora', label: 'BORA Agora', icon: PartyPopper },
  { key: 'bares', label: 'Bares', icon: Beer },
  { key: 'festas', label: 'Festas', icon: Music },
  { key: 'jantar', label: 'Jantar', icon: UtensilsCrossed },
];

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeShortcut, setActiveShortcut] = useState('agora');

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', 'recommended'],
    queryFn: () => eventsService.search({ now: activeShortcut === 'agora' }),
  });

  return (
    <div className="bg-background px-5 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-extrabold gradient-text">BORA</p>
          <p className="flex items-center gap-1 text-xs text-muted">
            <MapPin className="h-3.5 w-3.5" /> {user?.city ?? 'Barra da Tijuca, RJ'}
          </p>
        </div>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface"
          aria-label="Notificações"
          onClick={() => navigate('/profile')}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destaque" />
        </button>
      </div>

      <h1 className="mt-6 text-2xl font-extrabold leading-tight">O que você quer fazer hoje?</h1>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <Input placeholder="O que você está procurando?" className="pl-11" />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {SHORTCUTS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveShortcut(key)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors',
              activeShortcut === key
                ? 'border-transparent bg-bora-gradient text-white'
                : 'border-border bg-surface text-muted',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold">Eventos para você</h2>
        <button className="text-sm font-semibold text-destaque" onClick={() => navigate('/explore')}>
          Ver todos
        </button>
      </div>

      <div className="mt-4 space-y-4 pb-6">
        {isLoading && <p className="text-sm text-muted">Carregando...</p>}
        {events?.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <p className="font-semibold">Ainda não encontramos algo perto de você.</p>
            <p className="mt-1 text-sm text-muted">Experimente aumentar sua distância ou explorar outra cidade.</p>
          </div>
        )}
        {events?.map((event) => (
          <EventCard key={event.id} event={event} score={88} />
        ))}
      </div>
    </div>
  );
}
