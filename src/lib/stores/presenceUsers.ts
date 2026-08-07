import { writable } from 'svelte/store';

export interface UserPresence {
    online: boolean;
    lastSeen: Date | null;
    typing: boolean;
    recording: boolean;
    currentConversationId: string | null;
}

export const presenceMapStore = writable<Record<string, UserPresence>>({});