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

    const title =
        payload.notification?.title ||
        "Zingram";

    const body =
        payload.notification?.body ||
        "You have a new message.";

    const senderId =
        payload.data?.senderId;

    const notificationOptions = {
        body,

        icon: "/zingram-96x96.png.PNG",

        badge: "/zingram-48x48.png.PNG",

        tag: senderId
            ? `zingram-sender-${senderId}`
            : "zingram-message",

        renotify: true,

        data: payload.data || {}
    };

    self.registration.showNotification(
        title,
        notificationOptions
    );
});