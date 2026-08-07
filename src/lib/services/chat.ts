import { db, auth } from '$lib/firebase/firebase';
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp, deleteField, where, query, getDocs } from 'firebase/firestore';
import { ConversationStore, type ConversationState } from '$lib/stores/conversation';
import { onAuthStateChanged, type User } from "firebase/auth";

export function waitForAuth(): Promise<User | null> {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}


export async function loadConversation(id:string){

    const conversationRef = doc(db,'conversations',id);

    const conversationSnap = await getDoc(conversationRef);


    if(!conversationSnap.exists()){
        throw new Error("Conversation not found");
    }


    const conversation = {
        id: conversationSnap.id,
        ...conversationSnap.data()
    } as ConversationState;


    ConversationStore.set(conversation);

    return conversation;
}


export async function sendMessage(
    conversationId: string,
    text: string | null,
    type: "text" | "image" | "video" | "audio" | "document" | "deleted" = "text",
    fileUrl: string | null = null,
    duration: number | null = null
) {

    const currentUser = await waitForAuth();

    if (!currentUser) {
        throw new Error("No authenticated user");
    }

    await addDoc(
        collection(db, "messages"),
        {
            conversationId,
            senderId: currentUser.uid,
            type,
            text,
            fileUrl,
            duration,
            createdAt: serverTimestamp(),
            editedAt: null,
            deletedAt: null,
        }
    );

    await updateDoc(
        doc(db, "conversations", conversationId),
        {
            lastMessage:
                type === "text"
                    ? text
                    : `[${type}]`,

            lastMessageType: type,

            lastMessageSender: currentUser.uid,

            lastMessageTime: serverTimestamp(),

            updatedAt: serverTimestamp()
        }
    );
}

export async function editMessage(
    messageId:string,
    newText:string
){

    await updateDoc(
        doc(db,"messages",messageId),
        {
            text:newText,
            editedAt:serverTimestamp()
        }
    );

}

export async function deleteMessage(messageId: string) {

    const currentUser = await waitForAuth();

    if (!currentUser) {
        throw new Error("No authenticated user");
    }


    const messageRef = doc(
        db,
        "messages",
        messageId
    );


    await updateDoc(messageRef, {

        type: "deleted",

        text: "This message was deleted",

        fileUrl: null,

        deletedAt: serverTimestamp()

    });

}