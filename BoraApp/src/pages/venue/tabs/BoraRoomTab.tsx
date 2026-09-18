import { ChatThread } from '@/components/ChatThread';
import { chatService } from '@/services/chat.service';

export function BoraRoomTab({ eventId }: { eventId: string }) {
  return (
    <div className="flex h-[60vh] flex-col">
      <p className="mb-2 text-xs text-muted">
        Sala temporária do evento — some do check-in que sobrar por 48h. Só quem tem interesse, confirmou ou fez
        check-in participa.
      </p>
      <ChatThread
        queryKey={['chat', 'room', eventId]}
        fetchMessages={() => chatService.roomMessages(eventId)}
        sendMessage={(body) => chatService.postRoomMessage(eventId, body)}
        emptyLabel="Nenhuma mensagem ainda. Puxe assunto!"
      />
    </div>
  );
}
