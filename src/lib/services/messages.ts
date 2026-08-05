
import { db } from "$lib/firebase/firebase";
import { messagesStore, type MessageState } from "$lib/stores/messages";

import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot
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

        messagesStore.set(messages);

    });

    return unsubscribe;
}