import { writable } from "svelte/store";

export interface MessageState {
    id: string;

    conversationId: string;

    senderId: string;

    type: "text" | "image" | "video" | "audio" | "document";

    text: string | null;

    fileUrl: string | null;
    duration: number| null;
    createdAt: any;
}

export const messagesStore = writable<MessageState[]>([]);