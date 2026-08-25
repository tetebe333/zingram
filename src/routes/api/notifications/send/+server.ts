import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { FieldValue } from 'firebase-admin/firestore';
import {
    adminMessaging,
    adminDb
} from '$lib/server/firebaseAdmin';
export const POST: RequestHandler = async ({ request }) => {
    try {
        const {
            recipientId,
            senderId,
            conversationId,
            messageText
        } = await request.json();
        if (
            !recipientId ||
            !senderId ||
            !conversationId
        ) {
            return json(
                {
                    success: false,
                    message:
                        'Missing notification information.'
                },
                {
                    status: 400
                }
            );
        }
        console.log(
            'Notification request body:',
            {
                recipientId,
                senderId,
                conversationId,
                messageText
            }
        );
        // -----------------------------------------
        // RECIPIENT
        // -----------------------------------------
        const recipientRef =
            adminDb
                .collection('users')
                .doc(recipientId);
        const recipientSnap =
            await recipientRef.get();
        if (!recipientSnap.exists) {
            return json(
                {
                    success: false,
                    message:
                        'Recipient not found.'
                },
                {
                    status: 404
                }
            );
        }
        const recipientData =
            recipientSnap.data();
        const fcmToken =
            recipientData?.notificationFcmToken;
        if (!fcmToken) {
            console.log(
                'Recipient has no FCM token registered.'
            );
            return json({
                success: false,
                message:
                    'Recipient has no notification device registered.'
            });
        }
        // -----------------------------------------
        // SENDER
        // -----------------------------------------
        const senderRef =
            adminDb
                .collection('users')
                .doc(senderId);
        const senderSnap =
            await senderRef.get();
        if (!senderSnap.exists) {
            return json(
                {
                    success: false,
                    message:
                        'Sender not found.'
                },
                {
                    status: 404
                }
            );
        }
        const senderData =
            senderSnap.data();
        const senderName =
            senderData?.fullName ||
            senderData?.username ||
            'Zingram user';
        const senderProfileImage =
            senderData?.profileImage ||
            '';
        // -----------------------------------------
        // NOTIFICATION COUNTER
        // -----------------------------------------
        /*
         * One counter belongs to one sender
         * talking to one recipient.
         *
         * Example:
         *
         * recipientA + senderA = 5
         * recipientA + senderB = 2
         *
         * They stay completely separate.
         */
        const counterId =
            `${recipientId}_${senderId}`;
        const counterRef =
            adminDb
                .collection('notificationCounters')
                .doc(counterId);
        const counterSnap =
            await counterRef.get();
        let notificationCount = 1;
        if (counterSnap.exists) {
            const counterData =
                counterSnap.data();
            notificationCount =
                (counterData?.count || 0) + 1;
        }
        await counterRef.set(
            {
                recipientId,
                senderId,
                count: notificationCount,
                senderName,
                senderProfileImage,
                updatedAt:
                    FieldValue.serverTimestamp()
            },
            {
                merge: true
            }
        );
        console.log(
            'Notification counter:',
            {
                senderId,
                recipientId,
                count: notificationCount
            }
        );
        // -----------------------------------------
        // SEND NOTIFICATION
        // -----------------------------------------
        try {
            const message = {
                notification: {
                    title: senderName,
                    body:
                        messageText ||
                        'You received a new message.'
                },
                data: {
                    conversationId,
                    senderId,
                    recipientId,
                    senderName,
                    senderProfileImage,
                    notificationCount:
                        String(notificationCount)
                },
                token: fcmToken
            };
            const messageId =
                await adminMessaging.send(message);
            console.log(
                'Notification sent:',
                messageId
            );
            return json({
                success: true,
                messageId,
                notificationCount
            });
        } catch (error: any) {
            console.error(
                'Notification send error:',
                error
            );
            if (
                error?.code ===
                    'messaging/registration-token-not-registered' ||
                error?.code ===
                    'messaging/installation-id-not-registered'
            ) {
                console.log(
                    'Removing stale FCM token for:',
                    recipientId
                );
                await recipientRef.update({
                    notificationFcmToken:
                        FieldValue.delete()
                });
                return json({
                    success: false,
                    message:
                        'Notification device is no longer registered.'
                });
            }
            throw error;
        }
    } catch (error) {
        console.error(
            'Notification endpoint error:',
            error
        );
        return json(
            {
                success: false,
                message:
                    'Failed to send notification.'
            },
            {
                status: 500
            }
        );
    }
};