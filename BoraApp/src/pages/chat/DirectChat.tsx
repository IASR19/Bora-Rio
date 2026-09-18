import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Flag, ShieldOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ChatThread } from '@/components/ChatThread';
import { blocksService } from '@/services/blocks.service';
import { chatService } from '@/services/chat.service';
import { deuBoraService } from '@/services/deu-bora.service';
import { reportsService } from '@/services/reports.service';
import { ApiError } from '@/shared/api/client';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { Chip } from '@/shared/ui/Chip';
import type { ReportCategory } from '@/types/domain';

const REPORT_CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'comportamento_inadequado', label: 'Comportamento inadequado' },
  { value: 'assedio', label: 'Assédio' },
  { value: 'perfil_falso', label: 'Perfil falso' },
  { value: 'spam', label: 'Spam' },
  { value: 'outro', label: 'Outro' },
];

export function DirectChat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState<ReportCategory | null>(null);
  const [reportSent, setReportSent] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  const { data: matches } = useQuery({ queryKey: ['deu-bora', 'matches'], queryFn: deuBoraService.myMatches });
  const match = matches?.find((m) => m.conversationId === conversationId);

  const handleBlock = async () => {
    if (!match) return;
    await blocksService.block(match.user.id).catch(() => undefined);
    setBlocked(true);
  };

  const handleSendReport = async () => {
    if (!match || !reportCategory) return;
    setReportError(null);
    try {
      await reportsService.create({ targetType: 'user', targetId: match.user.id, category: reportCategory });
      setReportSent(true);
    } catch (err) {
      setReportError(err instanceof ApiError ? err.message : 'Não foi possível enviar a denúncia.');
    }
  };

  if (!conversationId) return null;

  return (
    <div className="app-shell flex min-h-dvh flex-col bg-background px-5 pb-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="font-bold">{match?.user.name ?? 'Conversa'}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBlock}
            disabled={blocked}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface disabled:opacity-50"
            aria-label="Bloquear"
          >
            <ShieldOff className="h-4 w-4" />
          </button>
          <button
            onClick={() => setReportOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
            aria-label="Denunciar"
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>
      </div>

      {blocked && <p className="mt-2 text-xs text-muted">Você bloqueou essa pessoa — as mensagens dela não aparecem mais.</p>}

      <div className="mt-4 flex min-h-0 flex-1">
        <ChatThread
          queryKey={['chat', 'direct', conversationId]}
          fetchMessages={() => chatService.directMessages(conversationId)}
          sendMessage={(body) => chatService.postDirectMessage(conversationId, body)}
          emptyLabel="Diga oi 👋"
        />
      </div>

      <BottomSheet open={reportOpen} onOpenChange={setReportOpen} title="Denunciar pessoa">
        {reportSent ? (
          <p className="text-sm text-muted">Denúncia enviada. Obrigado por ajudar a manter o BORA confiável.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {REPORT_CATEGORIES.map(({ value, label }) => (
                <Chip key={value} selected={reportCategory === value} onClick={() => setReportCategory(value)}>
                  {label}
                </Chip>
              ))}
            </div>
            {reportError && <p className="text-sm text-destaque">{reportError}</p>}
            <Button className="w-full" onClick={handleSendReport} disabled={!reportCategory}>
              Enviar denúncia
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
