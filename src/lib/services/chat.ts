import { db, auth } from '$lib/firebase/firebase';
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp  } from 'firebase/firestore';
import { ConversationStore, type ConversationState } from '$lib/stores/conversation';



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
    type: "text" | "image" | "video" | "audio" | "document" = "text",
    fileUrl: string | null = null,
    duration: number | null = null
) {

    const currentUser = auth.currentUser;

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
            createdAt: serverTimestamp()
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