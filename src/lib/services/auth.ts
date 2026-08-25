// 1. Change relative paths to strict $lib paths and remove 'type' keyword
import { auth, db } from '$lib/firebase/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { type RegisterUser } from '$lib/types/user'; // Inline type specifier resolves Vite bundling quirks
import { collection, onSnapshot, getDocs, getDoc, query, where, updateDoc, doc, serverTimestamp, setDoc, deleteDoc} from 'firebase/firestore';
import { type UserState } from '$lib/stores/user'; 
import { userStore } from '$lib/stores/user';
import { audioStore } from '$lib/stores/audio';
import { usersStore } from '$lib/stores/users';
import { chatUserStore } from '$lib/stores/chatUser';
import { ConversationStore, type ConversationState } from '$lib/stores/conversation';
import { setOnline } from './presence';
import { loadUserPresence } from './presence';
import { onAuthStateChanged, type User, sendPasswordResetEmail, updatePassword, verifyBeforeUpdateEmail, EmailAuthProvider, reauthenticateWithCredential , reload, deleteUser } from "firebase/auth";
import { goto } from '$app/navigation';
import { registerFCM, requestNotificationPermission } from '$lib/firebase/messaging';

export function waitForAuth(): Promise<User | null> {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}


//change password
export async function changePassword(newPassword: string) {
    const currentUser = await waitForAuth();


    if (!currentUser) {
        throw new Error('No authenticated user found.');
    }

    if (!currentUser.email) {
        throw new Error('No email associated with this account.');
    }

    // The current password will already be verified
    // by the Settings screen before this function is called.

    await updatePassword(currentUser, newPassword);
}

//verify current user
export async function verifyCurrentPassword(currentPassword: string) {
    const user = await waitForAuth();

    if (!user || !user.email) {
        throw new Error('No authenticated user found.');
    }

    const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
    );

    await reauthenticateWithCredential(user, credential);
}

//password reset
export async function sendResetPasswordEmail(email: string) {
    if (!email) {
        throw new Error('Email is required');
    }

    await sendPasswordResetEmail(auth, email);
}

//change email
export async function changeEmail(newEmail: string) {
    const user = await waitForAuth();

    if (!user) {
        throw new Error('No authenticated user found.');
    }

    await verifyBeforeUpdateEmail(user, newEmail);
}

// Function to register a new user
export async function registerUser(userInfo: RegisterUser) {
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        userInfo.email,
        userInfo.password
    );
    const user = userCredential.user;
    // Save user details to Firestore
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: userInfo.fullName,
        dateOfBirth: userInfo.dob,
        email: userInfo.email,
        username: userInfo.username.toLowerCase(),
        profileImage: userInfo.avatar,
        gender: userInfo.gender,
        bio: null,
        title: null,
        language: "English",
        playbackSpeed: 1,
        website: null,
        facebook: null,
        instagram: null,
        whatsapp: null,
        lastSeen: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    await loadCurrentUser();
    // Notification setup is optional.
    // It must NEVER stop registration from succeeding.
    try {
        await requestNotificationPermission();
        await registerFCM(user.uid);
        console.log(
            "Zingram notification registration completed."
        );
    } catch (error) {
        console.warn(
            "Zingram notification registration skipped:",
            error
        );
    }
    return user;
}

// Update user avatar
export async function updateUserAvatar(avataUrl: string) {
    
    const user = await waitForAuth();
    if (!user) {
        throw new Error('No authenticated user found.');
    }

    await updateDoc(doc(db, 'users', user.uid), {
        profileImage: avataUrl 
    });
}

// Check if username exists
export async function userNameExist(userName: string): Promise<boolean> {
    const usernameQuery = query(
        collection(db, 'users'),
        where('username', '==', userName.toLowerCase())
    );
    const snapshort = await getDocs(usernameQuery);
    return !snapshort.empty;
}

// Check if email already exists
export async function emailExist(email: string): Promise<boolean> {
    const emailQuery = query(
        collection(db, 'users'),
        where('email', '==', email)
    );

    const snapshot = await getDocs(emailQuery);

    return !snapshot.empty;
}

// Login user
export async function loginUser(
    email: string,
    password: string
) {
    // Authenticate user
    const userCredential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
    await loadCurrentUser();
    // Notification setup is optional.
    // It must NEVER stop login from succeeding.
    try {
        await requestNotificationPermission();
        await registerFCM(userCredential.user.uid);
        console.log(
            "Zingram notification registration completed."
        );
    } catch (error) {
        console.warn(
            "Zingram notification registration skipped:",
            error
        );
    }
    return userCredential.user;
}


export async function loadCurrentUser() {
    
    const currentUser = await waitForAuth();

    if (!currentUser) {
        return null;
    }

    // Get user document
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error('User profile not found.');
    }

    const userData = userSnap.data() as UserState & {
        playbackSpeed: number;
        createdAt: any;
        updatedAt: any;
    };

    // Remove fields that don't belong in userStore
    const {
        playbackSpeed,
        ...userInfo
    } = userData;

    // Firebase Auth is the source of truth for the user's email
    const updatedUserInfo = {
        ...userInfo,
        email: currentUser.email ?? userInfo.email,
    } as UserState;

    // Save user information
    userStore.set(updatedUserInfo);

    // Save playback speed
    audioStore.update((state) => ({
        ...state,
        playbackSpeed: playbackSpeed ?? 1
    }));

    // Check if userPresence document exists
    const presenceRef = doc(db, "userPresence", currentUser.uid);
    const presenceSnap = await getDoc(presenceRef);

    // Create it only if it doesn't exist
    if (!presenceSnap.exists()) {
        await setDoc(presenceRef, {
            uid: currentUser.uid,

            online: true,

            lastSeen: null,

            typing: false,

            recording: false,

            currentConversationId: null,

            createdAt: serverTimestamp(),

            updatedAt: serverTimestamp()
        });
    }

    // User is online
    await setOnline();

    return updatedUserInfo;
}

export function loadUsers(): Promise<() => void> {
    return new Promise(async (resolve, reject) => {
        const currentUser = await waitForAuth();

        if (!currentUser) {
            resolve(() => {});
            return;
        }

        usersStore.update((state) => ({
            ...state,
            loading: true
        }));

        let firstSnapshot = true;

        const unsubscribe = onSnapshot(
            collection(db, 'users'),
            (snapshot) => {
                const users = snapshot.docs
                    .map((doc) => doc.data() as UserState)
                    .filter((user) => user.uid !== currentUser.uid);

                usersStore.set({
                    users,
                    loading: false
                });

                // Allow `await loadUsers()` to continue
                // only after the first snapshot has arrived.
                if (firstSnapshot) {
                    firstSnapshot = false;
                    resolve(unsubscribe);
                }
            },
            (error) => {
                console.error('Failed to listen for users:', error);

                usersStore.update((state) => ({
                    ...state,
                    loading: false
                }));

                if (firstSnapshot) {
                    firstSnapshot = false;
                    reject(error);
                }
            }
        );
    });
}
    //getting chat user data function
    export async function loadChatUser(uid: string) {

        const userRef = doc(db, 'users', uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error('Chat user not found.');
        }

    const userData = userSnap.data() as UserState;

    chatUserStore.set(userData);

    //start listening to this user's presence
    loadUserPresence(uid);

    return userData;
}

export async function findOrCreateConversation(chatUserUid:string) {
    const currentUser = await waitForAuth();
    if (!currentUser) {
        throw new Error('No authenticated user found.');
    }

    const conversationsSnapshot = await getDocs(
        collection(db, 'conversations')
    );

    //getting existing chat
    const existingConversation = conversationsSnapshot.docs.find((doc) => {

        const conversation = doc.data();

        const participants = conversation.participants as string[];

        return (
            participants.includes(currentUser.uid) &&
            participants.includes(chatUserUid)
        );

    });

    //cheking if there was am existing chat if true open chat, if false creat new conversation and open chat
    if (existingConversation) {
        const conversationData = existingConversation.data() as ConversationState;

        const conversation = {
            ...conversationData,
            id: existingConversation.id
        }    
        
       ConversationStore.set(conversation);
       return conversation
          
    } else {
        const conversationRef = doc(
            collection(db, 'conversations')
        );
        //setting the new chat
        await setDoc(conversationRef, {
            participants: [
                currentUser.uid,
                chatUserUid
            ],

            lastMessage: '',

            lastMessageType: null,

            lastMessageSender: null,

            lastMessageTime: null,

            unread: {
                [currentUser.uid]: 0,
                [chatUserUid]: 0
            },

            createdAt: serverTimestamp(),

            updatedAt: serverTimestamp()
        });

        //creating chat object
        const newConversation: ConversationState = {
            id: conversationRef.id,

            participants: [
                currentUser.uid,
                chatUserUid
            ],

            lastMessage: '',

            lastMessageType: null,

            lastMessageSender: null,

            lastMessageTime: null,

            unread: {
                [currentUser.uid]: 0,
                [chatUserUid]: 0
            },

            createdAt: new Date(),

            updatedAt: new Date()
        };

        ConversationStore.set(newConversation);

        return newConversation;
    }
}

// Check Firebase Auth email and update userStore if it has changed
export async function checkAndUpdateEmail() {
    const currentUser = await waitForAuth();

    if (!currentUser || !currentUser.email) {
        return;
    }

    // Get the latest information from Firebase
    await reload(currentUser);

    const firebaseEmail = currentUser.email;

    if (!firebaseEmail) {
        return;
    }

    // Only update the store if Firebase has a different email
    userStore.update((user) => {
        if (!user || user.email === firebaseEmail) {
            return user;
        }

        return {
            ...user,
            email: firebaseEmail
        };
    });
}

//delete user
// Delete the currently authenticated user's entire account and related data
export async function deleteAccount() {
    const currentUser = await waitForAuth();

    if (!currentUser) {
        throw new Error('No authenticated user found.');
    }

    const uid = currentUser.uid;

    // Find and delete every conversation
    // where this user is a participant.
    const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', uid)
    );

    const conversationsSnapshot = await getDocs(conversationsQuery);

    for (const conversationDoc of conversationsSnapshot.docs) {
        await deleteDoc(conversationDoc.ref);
    }

    // Find and delete every message
    // where this user is the sender.
    const messagesQuery = query(
        collection(db, 'messages'),
        where('senderId', '==', uid)
    );

    const messagesSnapshot = await getDocs(messagesQuery);

    for (const messageDoc of messagesSnapshot.docs) {
        await deleteDoc(messageDoc.ref);
    }

    // Delete user presence
    await deleteDoc(
        doc(db, 'userPresence', uid)
    ).catch(() => {
        // Ignore if the presence document does not exist.
    });

    // Delete the user's Firestore profile
    await deleteDoc(
        doc(db, 'users', uid)
    );

    // Delete Firebase Authentication account
    await deleteUser(currentUser);

    // Clear the local user store
    userStore.set(null);
}

export async function usergoto() {
        const currentUser = await waitForAuth();

        try {
            if (!currentUser) {
                goto('/login');
            }
        } catch (error) {
            console.error(error);
        }
    }