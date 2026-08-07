
import { db } from "$lib/firebase/firebase";
import { messagesStore, type MessageState } from "$lib/stores/messages";

import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";
import { auth } from "$lib/firebase/firebase";

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