// 1. Change relative paths to strict $lib paths and remove 'type' keyword
import { auth, db } from '$lib/firebase/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { type RegisterUser } from '$lib/types/user'; // Inline type specifier resolves Vite bundling quirks
import { collection, getDocs, getDoc, query, where, updateDoc, doc, serverTimestamp, setDoc, addDoc} from 'firebase/firestore';
import { type UserState } from '$lib/stores/user'; 
import { userStore } from '$lib/stores/user';
import { audioStore } from '$lib/stores/audio';
import { usersStore } from '$lib/stores/users';
import { chatUserStore } from '$lib/stores/chatUser';
import { ConversationStore, type ConversationState } from '$lib/stores/conversation';

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
        language: null,
        playbackSpeed: 1, 

        facebook: null,
        instagram: null,
        whatsapp: null,
        online: false,
        lastSeen: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await loadCurrentUser()

    return user;
}

// Update user avatar
export async function updateUserAvatar(avataUrl: string) {
    const user = auth.currentUser;
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

// Login user
export async function loginUser(email: string, password: string) {
    // Authenticate user
    const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

    return await loadCurrentUser()
}

export async function loadCurrentUser() {
    
    const currentUser = auth.currentUser;

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
        createdAt,
        updatedAt,
        ...userInfo
    } = userData;

    // Save only user information
    userStore.set({
        ...userInfo,
        online: true
    } as UserState);

    // Save playback speed
    audioStore.update((state) => ({
        ...state,
        playbackSpeed: playbackSpeed ?? 1
    }));

    // Update online status
    await updateDoc(userRef, {
        online: true,
        updatedAt: serverTimestamp()
    });

    return userInfo;
}

//getting all users from fire base
export async function loadUsers() {

    const currentUser = auth.currentUser;

    if (!currentUser) {
        return;
    }

    // Start loading
    usersStore.update((state) => ({
        ...state,
        loading: true
    }));

    // Get all users
    const snapshot = await getDocs(collection(db, 'users'));

    const users = snapshot.docs
        .map(doc => doc.data() as UserState)
        .filter(user => user.uid !== currentUser.uid);

    // Save to store
    usersStore.set({
        users,
        loading: false  
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

    return userData;
}

export async function findOrCreateConversation(chatUserUid:string) {
    const currentUser = auth.currentUser;
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

            createdAt: new Date(),

            updatedAt: new Date()
        };

        ConversationStore.set(newConversation);

        return newConversation;
    }
}