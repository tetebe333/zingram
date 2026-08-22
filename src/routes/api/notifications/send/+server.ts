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

        console.log(
            'Notification data is valid:',
            {
                recipientId,
                senderId,
                conversationId,
                messageText
            }
        );

        try {
            const message = {
                notification: {
                    title: 'Zingram',
                    body:
                        messageText ||
                        'You received a new message.'
                },

                data: {
                    conversationId,
                    senderId,
                    recipientId
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
                messageId
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