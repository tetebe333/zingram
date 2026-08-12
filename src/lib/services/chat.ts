import { db,  auth } from '$lib/firebase/firebase';
import { doc,  orderBy, getDoc, onSnapshot, collection, addDoc, updateDoc, serverTimestamp, deleteField, where, query, getDocs } from 'firebase/firestore';
import { ConversationStore, ConversationsStore, type ConversationState, conversationsLoadedStore } from '$lib/stores/conversation';
import { onAuthStateChanged, type User } from "firebase/auth";
import { loadUsers } from './auth';
import { type UserState } from '$lib/stores/user'; 
import { usersStore } from '$lib/stores/users';
import { get } from 'svelte/store';

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

export async function loadConversations() {
    const currentUser = await waitForAuth();

    if (!currentUser) {
        throw new Error("No authenticated user");
    }

    const conversationsRef = collection(db, "conversations");

    const conversationsQuery = query(
        conversationsRef,
        where("participants", "array-contains", currentUser.uid),
        orderBy("lastMessageTime", "desc")
    );

    return new Promise<() => void>((resolve) => {
        const unsubscribe = onSnapshot(
            conversationsQuery,
            (snapshot) => {
                const conversations: ConversationState[] =
                    snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    } as ConversationState));

                // Update the realtime store
                ConversationsStore.set(conversations);

                // Tell the UI that the first snapshot has arrived
                conversationsLoadedStore.set(true);

                // Resolve only once with the listener
                resolve(unsubscribe);
            },
            (error) => {
                console.error(
                    "Error listening to conversations:",
                    error
                );

                conversationsLoadedStore.set(true);
            }
        );
    });
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

    const conversationRef = doc(
        db,
        "conversations",
        conversationId
    );

    // Get the conversation
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
        throw new Error("Conversation not found");
    }

    const conversation =
        conversationSnap.data() as ConversationState;

    // Find the other user
    const recipientId = conversation.participants.find(
        (uid) => uid !== currentUser.uid
    );

    if (!recipientId) {
        throw new Error("Recipient not found");
    }

    // Save the message
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

    // Current unread count of recipient
    const currentRecipientUnread =
        conversation.unread?.[recipientId] ?? 0;

    // Update conversation
    await updateDoc(
        conversationRef,
        {
            lastMessage:
                type === "text"
                    ? text
                    : `[${type}]`,

            lastMessageType: type,

            lastMessageSender: currentUser.uid,

            lastMessageTime: serverTimestamp(),

            updatedAt: serverTimestamp(),

            [`unread.${recipientId}`]:
                currentRecipientUnread + 1
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


export async function loadConversationUser(
    participants: string[],
    currentUser: UserState
) {
    if (!currentUser) {
        return null;
    }

    // Find the other person in this conversation
    const conversationUserId = participants.find(
        (uid) => uid !== currentUser.uid
    );

    if (!conversationUserId) {
        return null;
    }

    // Make sure users have been loaded
    await loadUsers();

    // Get the users currently stored in usersStore
    const users = get(usersStore).users;

    // Find the exact user belonging to this conversation
    const conversationUser = users.find(
        (user: UserState) => user.uid === conversationUserId
    );

    return conversationUser ?? null;
}


export function listenAndClearUnread(conversationId: string, currentUid: string) {
    const conversationRef = doc(db, "conversations", conversationId);

    const unsubscribe = onSnapshot(conversationRef, async (snapshot) => {
        if (!snapshot.exists()) return;

        const conversation = snapshot.data();

        const unread = conversation.unread ?? {};
        const currentUnread = unread[currentUid] ?? 0;

        if (currentUnread > 0) {
            await updateDoc(conversationRef, {
                [`unread.${currentUid}`]: 0
            });
        }
    });

    return unsubscribe;
}