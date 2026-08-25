
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
messaging.onBackgroundMessage((payload) => {
    console.log(
        "[firebase-messaging-sw.js] Background message:",
        payload
    );
    const senderName =
        payload.data?.senderName ||
        payload.notification?.title ||
        "Zingram";
    const messageText =
        payload.data?.messageText ||
        payload.notification?.body ||
        "You received a new message.";
    const senderId =
        payload.data?.senderId;
    const senderProfileImage =
        payload.data?.senderProfileImage || "";
    const notificationCount =
        Number(
            payload.data?.notificationCount || "1"
        );
    /*
     * Keep every sender in their own notification group.
     */
    const notificationTag = senderId
        ? `zingram-sender-${senderId}`
        : "zingram-message";
    /*
     * Show the sender name and message count.
     */
    const title =
        notificationCount > 1
            ? `${senderName} (${notificationCount})`
            : senderName;
    /*
     * Use the sender's profile picture when
     * one exists. Otherwise use Zingram's icon.
     */
    const notificationIcon =
        senderProfileImage ||
        "/zingram-96x96.png.PNG";
    const notificationOptions = {
        body: messageText,
        icon: notificationIcon,
        badge:
            "/zingram-48x48.png.PNG",
        tag:
            notificationTag,
        data:
            payload.data || {}
    };
    self.registration.showNotification(
        title,
        notificationOptions
    );
});