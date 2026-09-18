import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/shared/api/client';
import { cn } from '@/utils/cn';

const POLL_INTERVAL_MS = 4000;

interface ChatThreadProps {
  queryKey: unknown[];
  fetchMessages: () => Promise<{ id: string; body: string; createdAt: string; sender: { id: string; name: string; avatarUrl: string | null } }[]>;
  sendMessage: (body: string) => Promise<unknown>;
  emptyLabel: string;
}

export function ChatThread({ queryKey, fetchMessages, sendMessage, emptyLabel }: ChatThreadProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data: messages,
    isError,
    error: loadError,
  } = useQuery({
    queryKey,
    queryFn: fetchMessages,
    refetchInterval: POLL_INTERVAL_MS,
    retry: false,
  });

  const accessDenied = loadError instanceof ApiError && loadError.status === 403;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages?.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendMessage(body);
      setDraft('');
      await queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível enviar a mensagem.');
    } finally {
      setSending(false);
    }
  };

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 text-center">
        <p className="text-sm text-muted">
          {accessDenied
            ? 'Você precisa demonstrar interesse, confirmar presença ou fazer check-in nesse evento pra entrar aqui.'
            : 'Não foi possível carregar as mensagens.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto py-2">
        {!messages?.length && <p className="py-4 text-center text-sm text-muted">{emptyLabel}</p>}
        {messages?.map((message) => {
          const mine = message.sender.id === user?.id;
          return (
            <div key={message.id} className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
              {!mine && <p className="mb-0.5 px-1 text-[11px] font-semibold text-muted">{message.sender.name}</p>}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                  mine ? 'bg-bora-gradient text-white' : 'border border-border bg-surface',
                )}
              >
                {message.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="pb-1 text-xs text-destaque">{error}</p>}

      <form onSubmit={handleSend} className="flex items-center gap-2 pb-2 pt-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escrever mensagem..."
          className="h-12 flex-1 rounded-full border border-border bg-surface px-4 text-sm outline-none focus:border-destaque"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bora-gradient text-white disabled:opacity-50"
          aria-label="Enviar"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
