import { apiFetch } from '@/shared/api/client';
import type { ChatMessage } from '@/types/domain';

export const chatService = {
  roomMessages: (eventId: string) => apiFetch<ChatMessage[]>(`/chat/rooms/${eventId}/messages`),
  postRoomMessage: (eventId: string, body: string) =>
    apiFetch<ChatMessage>(`/chat/rooms/${eventId}/messages`, { method: 'POST', body: { body } }),
  directMessages: (conversationId: string) => apiFetch<ChatMessage[]>(`/chat/direct/${conversationId}/messages`),
  postDirectMessage: (conversationId: string, body: string) =>
    apiFetch<ChatMessage>(`/chat/direct/${conversationId}/messages`, { method: 'POST', body: { body } }),
};
