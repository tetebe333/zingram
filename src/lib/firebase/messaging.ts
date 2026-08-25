import {
    getToken,
    onMessage
} from 'firebase/messaging';

import {
    getFirebaseMessaging,
    db
} from '$lib/firebase/firebase';

import {
    doc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';

const VAPID_KEY =
    "BKVv4C47w_wn9pcVTEmqQME8t8YuV0d-qoBKRtQTFiAIMeLix0Dhxb0oq7KLVBOEwqpbCi60dmzbIj-06zYitbM";

export async function registerFCM(userId: string) {
    const messaging = await getFirebaseMessaging();

    if (!messaging) {
        throw new Error(
            "Firebase Messaging is not supported."
        );
    }

    if (typeof Notification === 'undefined') {
        throw new Error(
            "Notifications are not supported."
        );
    }

    if (Notification.permission !== "granted") {
        throw new Error(
            "Notification permission is not granted."
        );
    }

    // Get the actual FCM registration token
    const fcmToken = await getToken(
        messaging,
        {
            vapidKey: VAPID_KEY
        }
    );

    if (!fcmToken) {
        throw new Error(
            "Firebase did not return an FCM token."
        );
    }

    console.log(
        "Zingram FCM token received."
    );

    // Save the actual FCM token
    await setDoc(
        doc(db, "users", userId),
        {
            notificationFcmToken: fcmToken,
            notificationUpdatedAt:
                serverTimestamp()
        },
        {
            merge: true
        }
    );

    console.log(
        "Zingram FCM token saved."
    );

    return fcmToken;
}

export function listenForForegroundMessages() {
    getFirebaseMessaging()
        .then((messaging) => {
            if (!messaging) {
                return;
            }

            onMessage(
                messaging,
                (payload) => {
                    console.log(
                        "Zingram foreground notification:",
                        payload
                    );

                    // Show an actual browser popup
                    if (
                        typeof Notification === 'undefined' ||
                        Notification.permission !== 'granted'
                    ) {
                        return;
                    }

                    const title =
                        payload.notification?.title ||
                        "Zingram";

                    const body =
                        payload.notification?.body ||
                        "You have a new message.";

                    const notification =
                        new Notification(
                            title,
                            {
                                body,
                                icon:
                                    "/zingram-96x96.png.PNG",
                                badge:
                                    "/zingram-48x48.png.PNG",
                                data:
                                    payload.data || {}
                            }
                        );

                    // Clicking the notification
                    // focuses the Zingram window.
                    notification.onclick = () => {
                        window.focus();
                        notification.close();
                    };
                }
            );
        })
        .catch((error) => {
            console.error(
                "Foreground notification listener failed:",
                error
            );
        });
}

export async function requestNotificationPermission() {
    if (typeof Notification === 'undefined') {
        throw new Error(
            "Notifications are not supported."
        );
    }

    const permission =
        await Notification.requestPermission();

    if (permission !== "granted") {
        throw new Error(
            "Notification permission was not granted."
        );
    }

    return permission;
}