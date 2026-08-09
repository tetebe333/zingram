import { writable } from 'svelte/store';

export interface ConversationState {
    id: string;
    participants: string[];
    lastMessage: string | null;
    lastMessageType:
        | 'text'
        | 'image'
        | 'video'
        | 'audio'
        | 'document'
        | 'deleted'
        | null;
    lastMessageSender: string | null;
    lastMessageTime: any;

    createdAt: Date | null;
    updatedAt: Date | null;

    unread: Record<string, number>;
}

export const ConversationStore =
    writable<ConversationState | null>(null);

export const ConversationsStore =
    writable<ConversationState[]>([]);