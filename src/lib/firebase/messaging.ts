import {
    getToken
} from "firebase/messaging";

import { getFirebaseMessaging, db } from "$lib/firebase/firebase";
import {
    doc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";

const VAPID_KEY =
    "BKVv4C47w_wn9pcVTEmqQME8t8YuV0d-qoBKRtQTFiAIMeLix0Dhxb0oq7KLVBOEwqpbCi60dmzbIj-06zYitbM";

export async function registerFCM(userId: string) {
    const messaging = await getFirebaseMessaging();

    if (!messaging) {
        throw new Error(
            "Firebase Messaging is not supported."
        );
    }

    const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
    });

    if (!token) {
        throw new Error(
            "Unable to register this device for notifications."
        );
    }

    console.log(
        "Zingram notification FCM token:",
        token
    );

    await setDoc(
        doc(db, "users", userId),
        {
            notificationFcmToken: token,
            notificationUpdatedAt: serverTimestamp()
        },
        {
            merge: true
        }
    );

    console.log(
        "FCM registration completed."
    );

    return token;
}

export async function requestNotificationPermission() {
    if (typeof Notification === "undefined") {
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