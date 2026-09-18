import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { deuBoraService } from '@/services/deu-bora.service';

export function Matches() {
  const navigate = useNavigate();
  const { data: matches } = useQuery({ queryKey: ['deu-bora', 'matches'], queryFn: deuBoraService.myMatches });

  return (
    <div className="bg-background px-5 pt-6">
      <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="mt-4 text-2xl font-extrabold">Conexões</h1>
      <p className="mt-1 text-sm text-muted">Deu Bora — interesse mútuo depois de um evento.</p>

      <div className="mt-6 space-y-2">
        {matches?.length ? (
          matches.map((match) => (
            <button
              key={match.conversationId}
              onClick={() => navigate(`/chat/${match.conversationId}`)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-bora-gradient-soft text-sm font-bold text-destaque">
                {match.user.avatarUrl ? (
                  <img src={match.user.avatarUrl} className="h-full w-full object-cover" alt={match.user.name} />
                ) : (
                  match.user.name.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{match.user.name}</p>
                {match.user.city && <p className="text-xs text-muted">{match.user.city}</p>}
              </div>
              <Heart className="h-4 w-4 shrink-0 fill-destaque text-destaque" />
            </button>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-muted">
            Nenhuma conexão ainda — dá bora num evento e, se rolar interesse mútuo depois, aparece aqui.
          </p>
        )}
      </div>
    </div>
  );
}
