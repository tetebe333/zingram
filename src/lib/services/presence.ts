import { auth, db } from '$lib/firebase/firebase';
import {
    doc,
    updateDoc,
    serverTimestamp,
    onSnapshot,
    getDoc
} from 'firebase/firestore';

import { presenceStore } from '$lib/stores/presence';
import { presenceMapStore } from '$lib/stores/presenceUsers';

import {
    onAuthStateChanged,
    type User
} from 'firebase/auth';


// -----------------------------------------
// WAIT FOR AUTH
// -----------------------------------------

export function waitForAuth(): Promise<User | null> {
    return new Promise((resolve) => {
        const unsubscribe =
            onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user);
            });
    });
}


// -----------------------------------------
// ONLINE / OFFLINE
// -----------------------------------------

export async function setOnline() {
    const currentUser = await waitForAuth();

    if (!currentUser) return;

    await updateDoc(
        doc(
            db,
            'userPresence',
            currentUser.uid
        ),
        {
            online: true,
            lastSeen:
                serverTimestamp()
        }
    );
}


export async function setOffline() {
    const currentUser = await waitForAuth();

    if (!currentUser) return;

    await updateDoc(
        doc(
            db,
            'userPresence',
            currentUser.uid
        ),
        {
            online: false,
            lastSeen:
                serverTimestamp()
        }
    );
}


// -----------------------------------------
// CURRENT CONVERSATION
// -----------------------------------------

export async function setCurrentConversation(
    conversationId: string
) {
    const currentUser = await waitForAuth();

    if (!currentUser) return;

    await updateDoc(
        doc(
            db,
            'userPresence',
            currentUser.uid
        ),
        {
            currentConversationId:
                conversationId,

            lastActiveAt:
                serverTimestamp()
        }
    );
}


export async function updateCurrentConversationActivity() {
    const currentUser = await waitForAuth();

    if (!currentUser) return;

    await updateDoc(
        doc(
            db,
            'userPresence',
            currentUser.uid
        ),
        {
            lastActiveAt:
                serverTimestamp()
        }
    );
}


export async function clearCurrentConversation(
    conversationId: string
) {
    const currentUser = await waitForAuth();

    if (!currentUser) return;

    const presenceRef =
        doc(
            db,
            'userPresence',
            currentUser.uid
        );

    const presenceSnap =
        await getDoc(presenceRef);

    if (!presenceSnap.exists()) return;

    const presenceData =
        presenceSnap.data();

    if (
        presenceData?.currentConversationId !==
        conversationId
    ) {
        return;
    }

    await updateDoc(
        presenceRef,
        {
            currentConversationId: null,
            lastActiveAt: null
        }
    );
}


// -----------------------------------------
// TYPING
// -----------------------------------------

export async function setTyping(
    isTyping: boolean,
    conversationId: string | null
) {
    const currentUser = await waitForAuth();

    if (!currentUser) return;

    await updateDoc(
        doc(
            db,
            'userPresence',
            currentUser.uid
        ),
        {
            typing: isTyping
        }
    );
}


// -----------------------------------------
// RECORDING
// -----------------------------------------

export async function setRecording(
    isRecording: boolean,
    conversationId: string | null
) {
    const currentUser = await waitForAuth();

    if (!currentUser) return;

    await updateDoc(
        doc(
            db,
            'userPresence',
            currentUser.uid
        ),
        {
            recording: isRecording
        }
    );
}


// -----------------------------------------
// UPDATE LAST SEEN
// -----------------------------------------

export async function updateLastSeen() {
    const currentUser = await waitForAuth();

    if (!currentUser) return;

    await updateDoc(
        doc(
            db,
            'userPresence',
            currentUser.uid
        ),
        {
            lastSeen:
                serverTimestamp()
        }
    );
}


// -----------------------------------------
// LOAD ONE USER PRESENCE
// -----------------------------------------

export function loadUserPresence(
    uid: string
) {
    const presenceRef =
        doc(
            db,
            'userPresence',
            uid
        );

    return onSnapshot(
        presenceRef,
        (snapshot) => {
            if (!snapshot.exists()) return;

            const data =
                snapshot.data();

            presenceStore.set({
                ...data,

                lastSeen:
                    data.lastSeen
                        ?.toDate?.() ?? null
            } as any);
        }
    );
}


// -----------------------------------------
// LOAD MULTIPLE USERS PRESENCE
// -----------------------------------------

export function loadUsersPresence(
    uids: string[]
) {
    const unsubscribers:
        (() => void)[] = [];

    for (const uid of uids) {
        const unsubscribe =
            onSnapshot(
                doc(
                    db,
                    'userPresence',
                    uid
                ),
                (snapshot) => {
                    if (!snapshot.exists()) return;

                    const data =
                        snapshot.data();

                    presenceMapStore.update(
                        (current) => ({
                            ...current,

                            [uid]: {
                                online:
                                    data.online ??
                                    false,

                                typing:
                                    data.typing ??
                                    false,

                                recording:
                                    data.recording ??
                                    false,

                                currentConversationId:
                                    data.currentConversationId ??
                                    null,

                                lastSeen:
                                    data.lastSeen
                                        ?.toDate?.() ??
                                    null
                            }
                        })
                    );
                }
            );

        unsubscribers.push(
            unsubscribe
        );
    }

    return () => {
        unsubscribers.forEach(
            (unsubscribe) =>
                unsubscribe()
        );
    };
}