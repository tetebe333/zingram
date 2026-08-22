import { setGlobalOptions } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { log } from "firebase-functions/logger";

initializeApp();

const db = getFirestore();

setGlobalOptions({
    maxInstances: 10
});

export const notifyOnNewMessage = onDocumentCreated(
    "messages/{messageId}",
    async (event) => {

        const messageSnap = event.data;

        if (!messageSnap) {
            log("No message data found.");
            return;
        }

        const message = messageSnap.data();

        const {
            conversationId,
            senderId
        } = message;

        // Make sure the message has the information we need
        if (!conversationId || !senderId) {
            log("Message is missing conversationId or senderId.");
            return;
        }

        log("New message created", {
            messageId: event.params.messageId,
            conversationId,
            senderId
        });

        // -----------------------------------------
        // 1. GET THE CONVERSATION
        // -----------------------------------------

        const conversationSnap = await db
            .collection("conversations")
            .doc(conversationId)
            .get();

        if (!conversationSnap.exists) {
            log("Conversation not found.");
            return;
        }

        const conversation = conversationSnap.data();

        // -----------------------------------------
        // 2. FIND THE RECIPIENT
        // -----------------------------------------

        const recipientId = conversation.participants.find(
            (uid) => uid !== senderId
        );

        if (!recipientId) {
            log("Recipient not found.");
            return;
        }

        log("Recipient found", {
            recipientId
        });

        // -----------------------------------------
        // 3. CHECK WHERE THE RECIPIENT IS
        // -----------------------------------------

        const presenceSnap = await db
            .collection("userPresence")
            .doc(recipientId)
            .get();

        if (presenceSnap.exists) {

            const presence = presenceSnap.data();

            const currentConversationId =
                presence.currentConversationId ?? null;

            // If the recipient is currently inside
            // THIS exact conversation, don't notify.
            if (currentConversationId === conversationId) {

                log(
                    "Recipient is currently inside this conversation. No notification."
                );

                return;
            }
        }

        // -----------------------------------------
        // 4. GET RECIPIENT PROFILE
        // -----------------------------------------

        const recipientSnap = await db
            .collection("users")
            .doc(recipientId)
            .get();

        if (!recipientSnap.exists) {
            log("Recipient profile not found.");
            return;
        }

        const recipient = recipientSnap.data();

        log("Recipient found", {
            uid: recipientId,
            name: recipient.fullName
        });

        // -----------------------------------------
        // 5. TEMPORARY STOP
        // -----------------------------------------
        //
        // We are NOT sending the notification yet.
        //
        // The next step will get the recipient's
        // active push-notification registration and
        // actually send the notification.

        log(
            "Recipient is eligible for notification."
        );
    }
);