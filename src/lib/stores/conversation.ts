import { writable } from 'svelte/store';

export { writable } from 'svelte/store'

export interface ConversationState{
    id: string,
    participants: string[],
    lastMessage: string | null,
    lastMessageType: 'text' | 'imgae' | 'video' | 'voice' | 'document' | null;
    lastMessageSender: string | null,
    lastMessageTime: any,
    createdAt: Date,
    updatedAt: Date
}

export const ConversationStore = writable<ConversationState | null>(null);