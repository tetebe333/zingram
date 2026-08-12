
import { db } from "$lib/firebase/firebase";
import { messagesStore, type MessageState, messagesLoadedStore } from "$lib/stores/messages";

import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
} from "firebase/firestore";

export function loadMessages(conversationId: string) {

    const messagesQuery = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationId),
        orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {

        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as MessageState[];

        messagesStore.update((current) => ({
            ...current,
            [conversationId]: messages
        }));

        messagesLoadedStore.update((current) => ({
            ...current,
            [conversationId]: true
        }));

    });

    return unsubscribe;
}