/*
 * Notification click
 *
 * IMPORTANT:
 * Register this BEFORE importing Firebase Messaging.
 */
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const data = event.notification.data || {};
    const conversationId = data.conversationId;

    if (!conversationId) {
        console.warn(
            "[firebase-messaging-sw.js] No conversationId found."
        );

        event.waitUntil(
            clients.openWindow("/")
        );

        return;
    }

    const chatUrl = new URL(
        `/chat/${conversationId}`,
        self.location.origin
    ).href;

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        })
        .then((clientList) => {

            /*
             * Look for an existing Zingram window.
             */
            for (const client of clientList) {

                if (
                    client.url.startsWith(
                        self.location.origin
                    ) &&
                    "focus" in client
                ) {
                    return client
                        .navigate(chatUrl)
                        .then(() => client.focus());
                }
            }

            /*
             * Zingram isn't currently open.
             * Open the exact conversation.
             */
            if (clients.openWindow) {
                return clients.openWindow(chatUrl);
            }
        })
    );
});


/*
 * Firebase
 */
importScripts(
    "https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js"
);


firebase.initializeApp({
    apiKey: "AIzaSyBLxBJfQ68sOwy4bWP-syF-s-xV2jJGAKY",
    authDomain: "zingram-eced2.firebaseapp.com",
    projectId: "zingram-eced2",
    storageBucket: "zingram-eced2.firebasestorage.app",
    messagingSenderId: "718765778066",
    appId: "1:718765778066:web:c30360f51827669c3e324b",
    measurementId: "G-TGW9CX3LMR"
});


const messaging = firebase.messaging();


/*
 * Background notifications
 */
messaging.onBackgroundMessage((payload) => {

    console.log(
        "[firebase-messaging-sw.js] Background message:",
        payload
    );


    /*
     * Sender name
     */
    const senderName =
        payload.data?.senderName ||
        payload.notification?.title ||
        "Zingram";


    /*
     * Message text
     */
    const messageText =
        payload.data?.messageText ||
        payload.notification?.body ||
        "You received a new message.";


    /*
     * Sender ID
     */
    const senderId =
        payload.data?.senderId;


    /*
     * Sender profile picture
     *
     * If the sender has a profile picture,
     * use it.
     *
     * Otherwise use the Zingram logo.
     */
    const senderProfileImage =
        payload.data?.senderProfileImage;


    const notificationIcon =
        senderProfileImage &&
        senderProfileImage.trim() !== ""
            ? senderProfileImage
            : "/zingram-96x96.png.PNG";


    /*
     * Notification badge
     *
     * This remains the Zingram logo.
     */
    const notificationBadge =
        "/zingram-48x48.png.PNG";


    /*
     * Notification count
     */
    const notificationCount =
        Number(
            payload.data?.notificationCount || "1"
        );


    /*
     * Keep every sender in their own
     * notification group.
     */
    const notificationTag =
        senderId
            ? `zingram-sender-${senderId}`
            : "zingram-message";


    /*
     * Show sender name and counter.
     */
    const title =
        notificationCount > 1
            ? `${senderName} (${notificationCount})`
            : senderName;


    /*
     * Notification options
     */
    const notificationOptions = {

        body: messageText,

        /*
         * Sender profile picture
         * OR Zingram logo fallback.
         */
        icon: notificationIcon,

        /*
         * Zingram badge.
         */
        badge: notificationBadge,

        /*
         * Group notifications from
         * the same sender.
         */
        tag: notificationTag,

        /*
         * Keep the Firebase data so
         * notificationclick can access
         * conversationId.
         */
        data: payload.data || {}
    };


    /*
     * Display notification.
     */
    self.registration.showNotification(
        title,
        notificationOptions
    );
});