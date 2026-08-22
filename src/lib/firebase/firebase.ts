import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from 'firebase/messaging';


const firebaseConfig = {
  apiKey: "AIzaSyBLxBJfQ68sOwy4bWP-syF-s-xV2jJGAKY",
  authDomain: "zingram-eced2.firebaseapp.com",
  projectId: "zingram-eced2",
  storageBucket: "zingram-eced2.firebasestorage.app",
  messagingSenderId: "718765778066",
  appId: "1:718765778066:web:c30360f51827669c3e324b",
  measurementId: "G-TGW9CX3LMR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, app };

export async function getFirebaseMessaging() {
    const supported = await isSupported();

    if (!supported) {
        return null;
    }

    return getMessaging(app);
}