import { db,  auth } from '$lib/firebase/firebase';
import { doc, orderBy, getDoc, onSnapshot, collection, addDoc, updateDoc, serverTimestamp, deleteField, where, query, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
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
    duration: number | null = null,
    replyTo: {
        messageId: string;
        senderId: string;
        type: "text" | "image" | "video" | "audio" | "document" | "deleted";
        text: string | null;
        fileUrl: string | null;
        duration: number | null;
    } | null = null
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
            replyTo,

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

    void fetch(
        "/api/notifications/send",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                recipientId,
                senderId: currentUser.uid,
                conversationId,

                messageText:
                    type === "text"
                        ? text
                        : `[${type}]`
            })
        }
    )
        .then(async (response) => {
            const result =
                await response.json();

            if (!response.ok) {
                console.error(
                    "Notification endpoint failed:",
                    result
                );

                return;
            }

            console.log(
                "Notification sent in background:",
                result
            );
        })
        .catch((error) => {
            console.error(
                "Background notification request failed:",
                error
            );
        });
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

export async function reactToMessage(
    messageId: string,
    emoji: "👍" | "😂" | "❤️" | "😭" | "🤬"
) {
    const currentUser = await waitForAuth();

    if (!currentUser) {
        throw new Error("No authenticated user");
    }

    const messageRef = doc(db, "messages", messageId);

    const messageSnap = await getDoc(messageRef);

    if (!messageSnap.exists()) {
        throw new Error("Message not found");
    }

    const message = messageSnap.data();

    const messageSenderId = message.senderId;
    const messageType = message.type;

    const reactions = message.reactions ?? {};

    const userId = currentUser.uid;

    const currentReactions = [
        "👍",
        "😂",
        "❤️",
        "😭",
        "🤬"
    ] as const;

    // If the user taps the reaction they already have → REMOVE
    if (reactions[emoji]?.includes(userId)) {

        await updateDoc(messageRef, {
            [`reactions.${emoji}`]: arrayRemove(userId)
        });

        return;
    }

    // Remove user's old reaction from every other emoji
    const updates: Record<string, any> = {};

    for (const reaction of currentReactions) {

        if (reaction !== emoji) {
            updates[`reactions.${reaction}`] =
                arrayRemove(userId);
        }
    }

    // Add the new reaction
    updates[`reactions.${emoji}`] =
        arrayUnion(userId);

    await updateDoc(messageRef, updates);

    // Create notification message
    let reactionMessage = '';

    if (message.text) {
        reactionMessage =
            `Reacted ${emoji} to “${message.text}”`;
    } else {
        let messagePreview = 'Message';

        switch (messageType) {
            case 'image':
                messagePreview = 'Photo';
                break;

            case 'video':
                messagePreview = 'Video';
                break;

            case 'audio':
                messagePreview = 'Audio';
                break;

            case 'document':
                messagePreview = 'Document';
                break;
        }

        reactionMessage =
            `Reacted ${emoji} to “${messagePreview}”`;
    }

    // Don't notify when reacting to your own message
    if (messageSenderId !== userId) {

        void fetch(
            "/api/notifications/send",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    recipientId: messageSenderId,
                    senderId: userId,
                    conversationId: message.conversationId,
                    messageText: reactionMessage
                })
            }
        )
            .then(async (response) => {
                const result =
                    await response.json();

                if (!response.ok) {
                    console.error(
                        "Reaction notification endpoint failed:",
                        result
                    );

                    return;
                }

                console.log(
                    "Reaction notification sent in background:",
                    result
                );
            })
            .catch((error) => {
                console.error(
                    "Background reaction notification request failed:",
                    error
                );
            });
    }
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