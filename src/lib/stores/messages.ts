import { writable } from "svelte/store";

export interface MessageState {
    id: string;

    conversationId: string;

    senderId: string;

    type: "text" | "image" | "video" | "audio" | "document" | "deleted";

    text: string | null;

    fileUrl: string | null;
    duration: number | null;
    createdAt: any;
    editedAt: any;
    deletedAt: any;
}
export const messagesStore =
    writable<Record<string, MessageState[]>>({});

export const messagesLoadedStore =
    writable<Record<string, boolean>>({});