import { writable } from 'svelte/store';

export interface PresenceState {
    uid: string | null;

    online: boolean;

    lastSeen: Date | null;

    typing: boolean;

    recording: boolean;

    currentConversationId: string | null;
}

const initialState: PresenceState = {
    uid: null,

    online: false,

    lastSeen: null,

    typing: false,

    recording: false,

    currentConversationId: null
};

export const presenceStore = writable<PresenceState>(initialState);